const cors = (origin, env) => {
  const allowed = (env.ALLOWED_ORIGIN || "").split(",").map(x => x.trim()).filter(Boolean);
  return {
    "Access-Control-Allow-Origin": allowed.includes(origin) ? origin : (allowed[0] || ""),
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Bootstrap-Key",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Vary": "Origin"
  };
};
const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json; charset=utf-8", ...headers } });
const enc = new TextEncoder();
const b64u = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_");
const unb64u = s => Uint8Array.from(atob(s.replace(/-/g,"+").replace(/_/g,"/") + "===".slice((s.length+3)%4)), c => c.charCodeAt(0));
async function derive(password, salt) {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name:"PBKDF2", salt, iterations:310000, hash:"SHA-256" }, key, 256);
  return b64u(bits);
}
async function sign(payload, secret) {
  const data = b64u(enc.encode(JSON.stringify(payload)));
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), {name:"HMAC",hash:"SHA-256"}, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return data + "." + b64u(sig);
}
async function verify(token, secret) {
  try {
    const [data, signature] = token.split(".");
    const key = await crypto.subtle.importKey("raw", enc.encode(secret), {name:"HMAC",hash:"SHA-256"}, false, ["verify"]);
    const ok = await crypto.subtle.verify("HMAC", key, unb64u(signature), enc.encode(data));
    const payload = JSON.parse(new TextDecoder().decode(unb64u(data)));
    return ok && payload.exp > Date.now() ? payload : null;
  } catch { return null; }
}
async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return "pbkdf2$310000$" + b64u(salt) + "$" + await derive(password, salt);
}
async function checkPassword(password, stored) {
  const [scheme, rounds, saltText, expected] = stored.split("$");
  if (scheme !== "pbkdf2" || rounds !== "310000") return false;
  return (await derive(password, unb64u(saltText))) === expected;
}
async function audit(db, actor, action, subject) {
  await db.prepare("INSERT INTO audit_log(actor, action, subject, created_at) VALUES(?,?,?,?)")
    .bind(actor || "system", action, subject || "", new Date().toISOString()).run();
}
async function auth(request, env) {
  const token = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i,"");
  if (!token) return null;
  const payload = await verify(token, env.SESSION_SECRET);
  if (!payload) return null;
  const user = await env.DB.prepare("SELECT id, username, role, active FROM users WHERE id=?").bind(payload.sub).first();
  return user && user.active ? user : null;
}
export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const headers = cors(origin, env);
    if (request.method === "OPTIONS") return new Response(null, {status:204, headers});
    const url = new URL(request.url);
    try {
      if (url.pathname === "/api/status" && request.method === "GET") {
        const row = await env.DB.prepare("SELECT COUNT(*) AS total FROM users").first();
        return json({ initialized: Number(row.total) > 0 }, 200, headers);
      }
      if (url.pathname === "/api/bootstrap" && request.method === "POST") {
        if (!env.BOOTSTRAP_KEY || request.headers.get("X-Bootstrap-Key") !== env.BOOTSTRAP_KEY)
          return json({error:"Chave de configuração inválida."},403,headers);
        const count = await env.DB.prepare("SELECT COUNT(*) AS total FROM users").first();
        if (Number(count.total) !== 0) return json({error:"A configuração inicial já foi concluída."},409,headers);
        const body = await request.json();
        const username = String(body.username || "").trim().toLowerCase();
        const password = String(body.password || "");
        if (!/^[a-z0-9._-]{3,40}$/.test(username) || password.length < 12)
          return json({error:"Informe um login válido e uma senha com pelo menos 12 caracteres."},400,headers);
        const result = await env.DB.prepare("INSERT INTO users(username,password_hash,role,active,created_at,updated_at) VALUES(?,?, 'admin',1,?,?)")
          .bind(username, await hashPassword(password), new Date().toISOString(), new Date().toISOString()).run();
        await audit(env.DB, username, "bootstrap_admin", username);
        return json({success:true,user_id:result.meta.last_row_id},201,headers);
      }
      if (url.pathname === "/api/login" && request.method === "POST") {
        const body = await request.json();
        const username = String(body.username || "").trim().toLowerCase();
        const password = String(body.password || "");
        const user = await env.DB.prepare("SELECT * FROM users WHERE username=?").bind(username).first();
        if (!user || !user.active || !(await checkPassword(password,user.password_hash)))
          return json({error:"Login ou senha inválidos."},401,headers);
        const token = await sign({sub:user.id, exp:Date.now()+8*60*60*1000}, env.SESSION_SECRET);
        await audit(env.DB, username, "login", username);
        return json({token, user:{id:user.id,username:user.username,role:user.role}},200,headers);
      }
      const user = await auth(request, env);
      if (!user) return json({error:"Sessão inválida ou expirada."},401,headers);
      if (url.pathname === "/api/me" && request.method === "GET")
        return json({id:user.id,username:user.username,role:user.role},200,headers);
      if (url.pathname === "/api/logout" && request.method === "POST")
        return json({success:true},200,headers);
      if (user.role !== "admin") return json({error:"Acesso restrito a administradores."},403,headers);
      if (url.pathname === "/api/users" && request.method === "GET") {
        const rows = await env.DB.prepare("SELECT id,username,role,active,created_at,updated_at FROM users ORDER BY username").all();
        return json({users:rows.results},200,headers);
      }
      if (url.pathname === "/api/users" && request.method === "POST") {
        const body = await request.json();
        const username = String(body.username || "").trim().toLowerCase();
        const password = String(body.password || "");
        const role = body.role === "admin" ? "admin" : "user";
        if (!/^[a-z0-9._-]{3,40}$/.test(username) || password.length < 12)
          return json({error:"Login inválido ou senha menor que 12 caracteres."},400,headers);
        const now = new Date().toISOString();
        try {
          const result = await env.DB.prepare("INSERT INTO users(username,password_hash,role,active,created_at,updated_at) VALUES(?,?,?,?,?,?)")
            .bind(username,await hashPassword(password),role,1,now,now).run();
          await audit(env.DB,user.username,"create_user",username);
          return json({id:result.meta.last_row_id,username,role,active:1},201,headers);
        } catch { return json({error:"Este login já está cadastrado."},409,headers); }
      }
      const match = url.pathname.match(/^\/api\/users\/(\d+)$/);
      if (match && request.method === "PATCH") {
        const id = Number(match[1]), body = await request.json();
        const target = await env.DB.prepare("SELECT id,username,role,active FROM users WHERE id=?").bind(id).first();
        if (!target) return json({error:"Usuário não encontrado."},404,headers);
        if (body.active === false && target.role === "admin" && target.active) {
          const n = await env.DB.prepare("SELECT COUNT(*) AS total FROM users WHERE role='admin' AND active=1").first();
          if (Number(n.total) <= 1) return json({error:"Mantenha pelo menos um administrador ativo."},409,headers);
        }
        if (body.password !== undefined) {
          if (String(body.password).length < 12) return json({error:"A nova senha deve ter pelo menos 12 caracteres."},400,headers);
          await env.DB.prepare("UPDATE users SET password_hash=?,updated_at=? WHERE id=?").bind(await hashPassword(body.password),new Date().toISOString(),id).run();
        }
        if (body.active !== undefined || body.role !== undefined) {
          const role = body.role === "admin" ? "admin" : (body.role === "user" ? "user" : target.role);
          const active = body.active === undefined ? target.active : (body.active ? 1 : 0);
          await env.DB.prepare("UPDATE users SET role=?,active=?,updated_at=? WHERE id=?").bind(role,active,new Date().toISOString(),id).run();
        }
        await audit(env.DB,user.username,"update_user",target.username);
        return json({success:true},200,headers);
      }
      if (match && request.method === "DELETE") {
        const id = Number(match[1]);
        if (id === user.id) return json({error:"Você não pode excluir a própria conta."},400,headers);
        const target = await env.DB.prepare("SELECT id,username,role,active FROM users WHERE id=?").bind(id).first();
        if (!target) return json({error:"Usuário não encontrado."},404,headers);
        if (target.role === "admin" && target.active) {
          const n = await env.DB.prepare("SELECT COUNT(*) AS total FROM users WHERE role='admin' AND active=1").first();
          if (Number(n.total) <= 1) return json({error:"Mantenha pelo menos um administrador ativo."},409,headers);
        }
        await env.DB.prepare("DELETE FROM users WHERE id=?").bind(id).run();
        await audit(env.DB,user.username,"delete_user",target.username);
        return json({success:true},200,headers);
      }
      return json({error:"Rota não encontrada."},404,headers);
    } catch (e) {
      return json({error:"Erro interno ao processar a solicitação."},500,headers);
    }
  }
};