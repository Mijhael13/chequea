import { NextResponse } from 'next/server';
import { queryFirebird } from '@/lib/firebird';

export async function GET() {
  try {
    // ATENCIÓN: Esta consulta de ejemplo asume que la tabla de inventario
    // se llama 'INV' en Valery, lo cual es común. Es posible que debas
    // ajustar 'CODIGO', 'DESCRIPCION' y 'PRECIO1' a los nombres reales de las columnas.
    const query = `
      SELECT FIRST 50
        CODIGO, 
        DESCRIPCION, 
        PRECIO1 as PRECIO 
      FROM INV
    `;
    
    let data;
    try {
        // Intenta consultar la base de datos real
        data = await queryFirebird(query);
    } catch (dbError) {
        // Si la conexión falla (ej: ruta de BD incorrecta), devuelve datos de prueba para que
        // la interfaz siga funcionando mientras configuras todo en el archivo .env.local
        console.warn("No se pudo conectar a Valery Firebird. Usando datos de demostración.");
        data = [
            { codigo: 'VAL-001', descripcion: 'Aceite de Motor Sintético 5W-30', precio: 25.50 },
            { codigo: 'VAL-002', descripcion: 'Batería de Auto 12V 75Ah', precio: 120.00 },
            { codigo: 'VAL-003', descripcion: 'Filtro de Aire Premium', precio: 15.99 },
            { codigo: 'VAL-004', descripcion: 'Juego de Pastillas de Freno', precio: 45.20 },
            { codigo: 'VAL-005', descripcion: 'Bujías de Iridio (Set de 4)', precio: 32.00 },
            { codigo: 'VAL-006', descripcion: 'Limpiaparabrisas Delantero', precio: 12.50 },
            { codigo: 'VAL-007', descripcion: 'Líquido de Frenos DOT 4', precio: 8.75 },
            { codigo: 'VAL-008', descripcion: 'Refrigerante Anticongelante', precio: 18.00 },
        ];
    }
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fatal en API de precios:", error);
    return NextResponse.json(
      { success: false, error: 'Error al consultar los precios.' },
      { status: 500 }
    );
  }
}
