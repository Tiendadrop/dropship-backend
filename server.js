const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors());
app.use(express.json());
const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}
const getProducts = () => {
    const file = path.join(DATA_DIR, 'productos.json');
    if (fs.existsSync(file)) {
        return JSON.parse(fs.readFileSync(file, 'utf-8'));
    }
    return getDefaultProducts();
};
const saveProducts = (products) => {
    fs.writeFileSync(path.join(DATA_DIR, 'productos.json'), JSON.stringify(products, null, 2));
};
const getOrders = () => {
    const file = path.join(DATA_DIR, 'pedidos.json');
    if (fs.existsSync(file)) {
        return JSON.parse(fs.readFileSync(file, 'utf-8'));
    }
    return [];
};
const saveOrders = (orders) => {
    fs.writeFileSync(path.join(DATA_DIR, 'pedidos.json'), JSON.stringify(orders, null, 2));
};
function getDefaultProducts() {
    const products = [
        { id: uuidv4(), nombre: "Organizador Inteligente", descripcion: "Caja organizadora modular con carga wireless", precioProveedor: 6, precioVenta: 22.99, imagen: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", categoria: "Hogar", proveedor: "AliExpress", proveedorId: "1008", stock: 999, ventas: 234, activo: true },
        { id: uuidv4(), nombre: "Kit de Maquillaje Profesional", descripcion: "180 colores palette de sombras profesional + pinceles", precioProveedor: 9, precioVenta: 34.99, imagen: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400", categoria: "Belleza", proveedor: "AliExpress", proveedorId: "1004", stock: 999, ventas: 203, activo: true },
        { id: uuidv4(), nombre: "Alfombrilla Yoga Premium", descripcion: "Mat de yoga spandex, antideslizante, ejercicio pilates", precioProveedor: 7, precioVenta: 24.99, imagen: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400", categoria: "Deportes", proveedor: "AliExpress", proveedorId: "1007", stock: 999, ventas: 178, activo: true },
        { id: uuidv4(), nombre: "Auriculares Bluetooth Pro", descripcion: "Auriculares wireless con cancelación de ruido, batería de 30h", precioProveedor: 8.5, precioVenta: 29.99, imagen: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400", categoria: "Electrónica", proveedor: "AliExpress", proveedorId: "1001", stock: 999, ventas: 156, activo: true },
        { id: uuidv4(), nombre: "Mochila Impermeable USB", descripcion: "Mochila anti-robo con puerto USB integrado, resistente al agua", precioProveedor: 11, precioVenta: 34.99, imagen: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400", categoria: "Moda", proveedor: "AliExpress", proveedorId: "1006", stock: 999, ventas: 112, activo: true },
        { id: uuidv4(), nombre: "Lámpara LED Regulable", descripcion: "Lámpara de escritorio LED con touch control, carga USB", precioProveedor: 12, precioVenta: 39.99, imagen: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400", categoria: "Hogar", proveedor: "AliExpress", proveedorId: "1002", stock: 999, ventas: 89, activo: true },
        { id: uuidv4(), nombre: "Cargador Solar Portátil", descripcion: "Panel solar 20W impermeable para cargar dispositivos outdoor", precioProveedor: 15, precioVenta: 49.99, imagen: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400", categoria: "Electrónica", proveedor: "AliExpress", proveedorId: "1003", stock: 999, ventas: 67, activo: true },
        { id: uuidv4(), nombre: "Drone Mini Cámara 4K", descripcion: "Drone plegable con cámara 4K, gps, 30min autonomía", precioProveedor: 45, precioVenta: 129.99, imagen: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400", categoria: "Electrónica", proveedor: "AliExpress", proveedorId: "1005", stock: 999, ventas: 45, activo: true }
    ];
    saveProducts(products);
    return products;
}
function calculatePrice(precioProveedor, margenMinimo = 30) {
    const margen = precioProveedor * (margenMinimo / 100);
    return Math.round((precioProveedor + margen) * 100) / 100;
}
app.get('/api/productos', (req, res) => {
    const productos = getProducts().filter(p => p.activo);
    const sorted = productos.sort((a, b) => b.ventas - a.ventas);
    res.json(sorted);
});
app.get('/api/productos/:id', (req, res) => {
    const productos = getProducts();
    const producto = productos.find(p => p.id === req.params.id);
    if (producto) { res.json(producto); }
    else { res.status(404).json({ error: 'Producto no encontrado' }); }
});
app.get('/api/productos-mas-vendidos', (req, res) => {
    const productos = getProducts().filter(p => p.activo);
    const topProducts = productos.sort((a, b) => b.ventas - a.ventas).slice(0, 4);
    res.json(topProducts);
});
app.post('/api/pedidos', async (req, res) => {
    const { productos, cliente, metodoPago } = req.body;
    
    if (!productos || !cliente) {
        return res.status(400).json({ error: 'Faltan datos requeridos' });
    }
    const pedidoId = uuidv4();
    let total = 0;
    const items = [];
    for (const item of productos) {
        const productosDB = getProducts();
        const producto = productosDB.find(p => p.id === item.productoId);
        
        if (!producto) {
            return res.status(400).json({ error: `Producto no encontrado: ${item.productoId}` });
        }
        const subtotal = producto.precioVenta * item.cantidad;
        const beneficio = (producto.precioVenta - producto.precioProveedor) * item.cantidad;
        
        items.push({
            productoId: producto.id,
            nombre: producto.nombre,
            precio: producto.precioVenta,
            cantidad: item.cantidad,
            beneficio: beneficio,
            precioProveedor: producto.precioProveedor,
            proveedorId: producto.proveedorId
        });
        
        total += subtotal;
    }
    const pedido = {
        id: pedidoId,
        fecha: new Date().toISOString(),
        cliente: cliente,
        items: items,
        total: total,
        estado: 'pendiente',
        pago: { metodo: metodoPago || 'tarjeta', estado: 'pendiente' },
        proveedor: { ordenId: null, estado: 'pendiente', tracking: null },
        historial: [{ fecha: new Date().toISOString(), accion: 'Pedido creado, esperando pago' }]
    };
    const pedidos = getOrders();
    pedidos.push(pedido);
    saveOrders(pedidos);
    res.json({ success: true, pedidoId: pedidoId, total: total });
});
app.post('/api/pedidos/:id/pagar', async (req, res) => {
    const pedidos = getOrders();
    const pedido = pedidos.find(p => p.id === req.params.id);
    
    if (!pedido) {
        return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    if (pedido.pago.estado === 'completado') {
        return res.status(400).json({ error: 'El pedido ya está pagado' });
    }
    pedido.pago.estado = 'completado';
    pedido.pago.fecha = new Date().toISOString();
    pedido.estado = 'pagado';
    pedido.historial.push({
        fecha: new Date().toISOString(),
        accion: 'Pago confirmado - Iniciando automatización'
    });
    
    saveOrders(pedidos);
    const productosDB = getProducts();
    for (const item of pedido.items) {
        const producto = productosDB.find(p => p.id === item.productoId);
        if (producto) { producto.ventas += item.cantidad; }
    }
    saveProducts(productosDB);
    setTimeout(async () => {
        const pedidosActualizados = getOrders();
        const pedidoActualizado = pedidosActualizados.find(p => p.id === req.params.id);
        
        if (pedidoActualizado && pedidoActualizado.pago.estado === 'completado') {
            console.log('\n═══════════════════════════════════════════');
            console.log('🚀 INICIANDO AUTOMATIZACIÓN DE PEDIDO');
            console.log('═══════════════════════════════════════════');
            console.log(`📋 Pedido ID: ${pedidoActualizado.id}`);
            console.log(`👤 Cliente: ${pedidoActualizado.cliente.nombre} ${pedidoActualizado.cliente.apellidos}`);
            console.log(`📧 Email: ${pedidoActualizado.cliente.email}`);
            console.log(`📦 Items: ${pedidoActualizado.items.length}`);
            console.log('───────────────────────────────────────────');
            
            pedidoActualizado.items.forEach((item, idx) => {
                console.log(`${idx + 1}. ${item.nombre} x${item.cantidad} - €${item.beneficio.toFixed(2)}`);
            });
            console.log('───────────────────────────────────────────');
            console.log(`📍 Dirección: ${pedidoActualizado.cliente.direccion}`);
            console.log(`   ${pedidoActualizado.cliente.ciudad}, ${pedidoActualizado.cliente.pais}`);
            console.log(`   CP: ${pedidoActualizado.cliente.codigoPostal}`);
            console.log(`   📱 Tel: ${pedidoActualizado.cliente.telefono}`);
            console.log('═══════════════════════════════════════════\n`);
            
            const mensaje = `🚀 NUEVO PEDIDO!\n\n📋 ID: ${pedidoActualizado.id}\n👤 Cliente: ${pedidoActualizado.cliente.nombre} ${pedidoActualizado.cliente.apellidos}\n📧 Email: ${pedidoActualizado.cliente.email}\n📱 Tel: ${pedidoActualizado.cliente.telefono}\n\n📦 PRODUCTOS:\n${pedidoActualizado.items.map((i, idx) => `${idx + 1}. ${i.nombre} x${i.cantidad} - €${i.precio.toFixed(2)}`).join('\n')}\n\n💰 TOTAL: €${pedidoActualizado.total.toFixed(2)}\n\n📍 DIRECCIÓN:\n${pedidoActualizado.cliente.direccion}\n${pedidoActualizado.cliente.ciudad}, ${pedidoActualizado.cliente.pais}\nCP: ${pedidoActualizado.cliente.codigoPostal}`;
            
            fetch(`https://api.telegram.org/bot8791673183:AAE30XKSjFdLZ5c-lwwqa2tcK_0dGYaSFLo/sendMessage?chat_id=-5299638230&text=${encodeURIComponent(mensaje)}`)
                .then(() => console.log('✅ Telegram: Mensaje enviado'))
                .catch(e => console.log('❌ Telegram error:', e.message));
            
            pedidoActualizado.proveedor.estado = 'enviado';
            pedidoActualizado.proveedor.tracking = 'TRK' + Date.now();
            pedidoActualizado.proveedor.estimadoDias = 20;
            pedidoActualizado.estado = 'procesando';
            pedidoActualizado.historial.push({
                fecha: new Date().toISOString(),
                accion: `Pedido enviado. Tracking: ${pedidoActualizado.proveedor.tracking}`
            });
            saveOrders(pedidosActualizados);
        }
    }, 2000);
    res.json({ success: true, mensaje: 'Pago confirmado. Pedido en procesamiento.' });
});
app.get('/api/test', (req, res) => {
    const productos = getProducts();
    const producto = productos[0];
    
    if (!producto) {
        return res.json({ error: 'No hay productos' });
    }
    
    const mensaje = `🚀 NUEVO PEDIDO DE PRUEBA\n\n📦 Producto: ${producto.nombre}\n💰 Precio: €${producto.precioVenta}\n\n✅ Todo funcionando!`;
    
    fetch(`https://api.telegram.org/bot8791673183:AAE30XKSjFdLZ5c-lwwqa2tcK_0dGYaSFLo/sendMessage?chat_id=-5299638230&text=${encodeURIComponent(mensaje)}`)
        .then(() => console.log('Telegram OK'))
        .catch(e => console.log('Telegram Error:', e.message));
    
    res.json({ success: true, producto: producto.nombre });
});
app.get('/api/pedidos', (req, res) => {
    const pedidos = getOrders();
    res.json(pedidos);
});
app.get('/api/pedidos/:id', (req, res) => {
    const pedidos = getOrders();
    const pedido = pedidos.find(p => p.id === req.params.id);
    if (pedido) { res.json(pedido); }
    else { res.status(404).json({ error: 'Pedido no encontrado' }); }
});
app.get('/api/stats', (req, res) => {
    const productos = getProducts();
    const pedidos = getOrders();
    
    const ingresosTotales = pedidos.filter(p => p.pago.estado === 'completado').reduce((sum, p) => sum + p.total, 0);
    const beneficiosTotales = pedidos.filter(p => p.pago.estado === 'completado').reduce((sum, p) => sum + p.items.reduce((s, i) => s + i.beneficio, 0), 0);
    const pedidosCompletados = pedidos.filter(p => p.pago.estado === 'completado').length;
    
    res.json({
        totalProductos: productos.length,
        pedidosTotales: pedidos.length,
        pedidosCompletados,
        ingresosTotales: Math.round(ingresosTotales * 100) / 100,
        beneficiosTotales: Math.round(beneficiosTotales * 100) / 100,
        productosTop: productos.sort((a, b) => b.ventas - a.ventas).slice(0, 5)
    });
});
app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
    console.log(`📊 Stats: http://localhost:${PORT}/api/stats`);
    console.log(`🛒 Productos: http://localhost:${PORT}/api/productos`);
});
