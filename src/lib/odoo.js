/**
 * Conector para Odoo ERP mediante API JSON-RPC oficial
 * Permite conectarse a instancias locales o remotas de Odoo (v14, v15, v16, v17, v18)
 */

export const getOdooConfig = () => {
  return {
    url: process.env.ODOO_URL || 'http://127.0.0.1:8069',
    db: process.env.ODOO_DB || 'odoo',
    username: process.env.ODOO_USERNAME || 'admin',
    password: process.env.ODOO_PASSWORD || 'admin',
  };
};

/**
 * Llama a la API JSON-RPC de Odoo
 */
async function callOdooRpc(url, service, method, args) {
  const jsonRpcUrl = `${url.replace(/\/+$/, '')}/jsonrpc`;
  const payload = {
    jsonrpc: '2.0',
    method: 'call',
    params: {
      service,
      method,
      args,
    },
    id: Math.floor(Math.random() * 1000000),
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

  try {
    const res = await fetch(jsonRpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Error HTTP ${res.status}: ${res.statusText}`);
    }

    const json = await res.json();
    if (json.error) {
      const msg = json.error.data?.message || json.error.message || 'Error de RPC Odoo';
      throw new Error(msg);
    }

    return json.result;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Autentica usuario en Odoo y devuelve el UID
 */
export async function authenticateOdoo({ url, db, username, password }) {
  const uid = await callOdooRpc(url, 'common', 'authenticate', [db, username, password, {}]);
  if (!uid) {
    throw new Error('Credenciales inválidas en Odoo (usuario o contraseña incorrectos)');
  }
  return uid;
}

/**
 * Consulta la lista de productos de Odoo (modelo product.template)
 */
export async function queryOdooProducts(config = {}) {
  const {
    url = process.env.ODOO_URL || 'http://127.0.0.1:8069',
    db = process.env.ODOO_DB || 'odoo',
    username = process.env.ODOO_USERNAME || 'admin',
    password = process.env.ODOO_PASSWORD || 'admin',
    limit = 60,
  } = config;

  // 1. Autenticar
  const uid = await authenticateOdoo({ url, db, username, password });

  // 2. Consultar modelo product.template
  const domain = [['sale_ok', '=', true]];
  const fields = ['id', 'name', 'default_code', 'list_price', 'qty_available', 'categ_id'];
  const kwargs = {
    fields,
    limit,
    order: 'id desc',
  };

  const records = await callOdooRpc(url, 'object', 'execute_kw', [
    db,
    uid,
    password,
    'product.template',
    'search_read',
    [domain],
    kwargs,
  ]);

  return records;
}
