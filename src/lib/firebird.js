import firebird from 'node-firebird';

const options = {};
options.host = process.env.FIREBIRD_HOST || '127.0.0.1';
options.port = process.env.FIREBIRD_PORT || 3050;
// Escapa las barras invertidas para rutas de Windows
options.database = process.env.FIREBIRD_DATABASE || 'C:\\Valery\\Datos\\DATOS.FDB';
options.user = process.env.FIREBIRD_USER || 'SYSDBA';
options.password = process.env.FIREBIRD_PASSWORD || 'masterkey';
options.lowercase_keys = true; // Para facilitar el manejo de datos en JS
options.role = null;           // default
options.pageSize = 4096;       // default when creating database

export const getFirebirdConnection = () => {
  return new Promise((resolve, reject) => {
    firebird.attach(options, function(err, db) {
      if (err) {
        console.error("Error al conectar a Firebird:", err);
        reject(err);
        return;
      }
      resolve(db);
    });
  });
};

export const queryFirebird = async (queryStr, params = []) => {
  const db = await getFirebirdConnection();
  return new Promise((resolve, reject) => {
    db.query(queryStr, params, function(err, result) {
      db.detach(); // Siempre cerrar la conexión al terminar
      if (err) {
        console.error("Error ejecutando query:", err);
        reject(err);
        return;
      }
      resolve(result);
    });
  });
};
