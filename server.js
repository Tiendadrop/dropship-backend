const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { getConfig, orderToSupplier, checkTracking } = require('./automatizacion');

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
        {
            id: uuidv4(),
            nombre: "Auriculares Bluetooth Pro",
            descripcion: "Auriculares wireless con cancelación de ruido, batería de 30h",
            precioProveedor: 8.50,
            precioVenta: 29.99,
            imagen: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
            categoria: "Electrónica",
            proveedor: "AliExpress",
            proveedorId: "1001",
            stock: 999,
            ventas: 156,
            activo: true
        },
        {
            id: uuidv4(),
            nombre: "Lámpara LED Regulable",
            descripcion: "Lámpara de escritorio LED con touch control, carga USB",
            precioProveedor: 12.00,
            precioVenta: 39.99,
            imagen: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400",
            categoria: "Hogar",
            proveedor: "AliExpress",
            proveedorId: "1002",
            stock: 999,
            ventas: 89,
            activo: true
        },
        {
            id: uuidv4(),
            nombre: "Cargador Solar Portátil",
            descripcion: "Panel solar 20W impermeable para cargar dispositivos outdoor",
            precioProveedor: 15.00,
            precioVenta: 49.99,
            imagen: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400",
            categoria: "Electrónica",
            proveedor: "AliExpress",
            proveedorId: "1003",
            stock: 999,
            ventas: 67,
            activo: true
        },
        {
            id: uuidv4(),
            nombre: "Kit de Maquillaje Profesional",
            descripcion: "180 colores palette de sombras profesional + pinceles",
            precioProveedor: 9.00,
            precioVenta: 34.99,
            imagen: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400",
            categoria: "Belleza",
            proveedor: "AliExpress",
            proveedorId: "1004",
            stock: 999,
            ventas: 203,
            activo: true
        },
        {
            id: uuidv4(),
            nombre: "Drone Mini Cámara 4K",
            descripcion: "Drone plegable con cámara 4K, gps, 30min autonomía",
            precioProveedor: 45.00,
            precioVenta: 129.99,
            imagen: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400",
            categoria: "Electrónica",
            proveedor: "AliExpress",
            proveedorId: "1005",
            stock: 999,
            ventas: 45,
            activo: true
        },
        {
            id: uuidv4(),
            nombre: "Mochila Impermeable USB",
            descripcion: "Mochila anti-robo con puerto USB integrado, resistente al agua",
            precioProveedor: 11.00,
            precioVenta: 34.99,
            imagen: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
            categoria: "Moda",
            proveedor: "AliExpress",
            proveedorId: "1006",
            stock: 999,
            ventas: 112,
            activo: true
        },
        {
            id: uuidv4(),
            nombre: "Alfombrilla Yoga Premium",
            descripcion: "Mat de yoga spandex, antideslizante, ekercicio pilates",
            precioProveedor: 7.00,
            precioVenta: 24.99,
            imagen: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400",
            categoria: "Deportes",
            proveedor: "AliExpress",
            proveedorId: "1007",
            stock: 999,
            ventas: 178,
            activo: true
        },
        {
            id: uuidv4(),
            nombre: "Organizador Inteligente",
            descripcion: "Caja organizadora modular con carga wireless",
            precioProveedor: 6.00,
            precioVenta: 22.99,
            imagen: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
            categoria: "Hogar",
            proveedor: "AliExpress",
            proveedorId: "1008",
            stock: 999,
            ventas: 234,
            activo: true
        }
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
    if (producto) {
        res.json(producto);
    } else {
        res.status(404).json({ error: 'Producto no encontrado' });
    }
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
            proveedorId: producto.proveedorId
        });
        
        total += subtotal;
    }

    const pedido = {
        id: pedidoId,
        fecha: new Date().toISOString(),
        cliente: {
            nombre: cliente.nombre,
            apellidos: cliente.apellidos,
            email: cliente.email,
            telefono: cliente.telefono,
            direccion: cliente.direccion,
            ciudad: cliente.ciudad,
            pais: cliente.pais,
            codigoPostal: cliente.codigoPostal
        },
        items: items,
        total: total,
        estado: 'pendiente',
        pago: {
            metodo: metodoPago || 'tarjeta',
            estado: 'pendiente'
        },
        proveedor: {
            ordenId: null,
            estado: 'pendiente',
            tracking: null
        },
        historial: [{
            fecha: new Date().toISOString(),
            accion: 'Pedido creado, esperando pago'
        }]
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

    for (const item of pedido.items) {
        const productosDB = getProducts();
        const producto = productosDB.find(p => p.id === item.productoId);
        if (producto) {
            producto.ventas += item.cantidad;
        }
        saveProducts(productosDB);
    }

    const config = getConfig();

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
            
            try {
                for (let i = 0; i < pedidoActualizado.items.length; i++) {
                    const item = pedidoActualizado.items[i];
                    console.log(`\n📦 Procesando item ${i + 1}/${pedidoActualizado.items.length}: ${item.nombre}`);
                    
                    const result = await orderToSupplier(
                        { ...item, proveedorId: item.proveedorId },
                        pedidoActualizado.cliente,
                        config
                    );
                    
                    if (result.success) {
                        console.log(`✅ Orden #${result.orderId} enviada al proveedor`);
                        console.log(`📮 Tracking: ${result.trackingNumber}`);
                        console.log(`⏱️ Entrega estimada: ${result.estimatedDays} días`);
                        
                        if (i === 0) {
                            pedidoActualizado.proveedor.ordenId = result.orderId;
                            pedidoActualizado.proveedor.tracking = result.trackingNumber;
                            pedidoActualizado.proveedor.estimadoDias = result.estimatedDays;
                        }
                    }
                    
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
                
                pedidoActualizado.proveedor.estado = 'enviado';
                pedidoActualizado.estado = 'procesando';
                pedidoActualizado.historial.push({
                    fecha: new Date().toISOString(),
                    accion: `Pedido enviado automáticamente al proveedor. Tracking: ${pedidoActualizado.proveedor.tracking}`
                });
                saveOrders(pedidosActualizados);
                
                console.log('\n═══════════════════════════════════════════');
                console.log('✅ AUTOMATIZACIÓN COMPLETADA');
                console.log('═══════════════════════════════════════════');
                console.log('📦 PEDIDO LISTO PARA FULFILL');
                console.log('───────────────────────────────────────────');
                console.log('Productos a comprar en AliExpress:');
                pedidoActualizado.items.forEach((item, idx) => {
                    console.log(`${idx + 1}. ${item.nombre} x${item.cantidad} - €${item.beneficio.toFixed(2)} beneficio`);
                });
                console.log('───────────────────────────────────────────');
                console.log('👤 Cliente: ' + pedidoActualizado.cliente.nombre + ' ' + pedidoActualizado.cliente.apellidos);
                console.log('📍 Dirección: ' + pedidoActualizado.cliente.direccion);
                console.log('   ' + pedidoActualizado.cliente.ciudad + ', ' + pedidoActualizado.cliente.pais);
                console.log('   CP: ' + pedidoActualizado.cliente.codigoPostal);
                console.log('   📱 Tel: ' + pedidoActualizado.cliente.telefono);
                console.log('═══════════════════════════════════════════\n');
                
                fetch('https://hook.eu1.make.com/9at6ffcjumyyvf04khdq83xameudfoss', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: pedidoActualizado.id,
                        cliente: pedidoActualizado.cliente,
                        items: pedidoActualizado.items.map(i => ({
                            nombre: i.nombre,
                            cantidad: i.cantidad,
                            precio: i.precio
                        })),
                        total: pedidoActualizado.total,
                        fecha: new Date().toISOString()
                    })
                }).catch(err => console.log('Make webhook: ' + err.message));
                
            } catch (error) {
                console.error('[AUTO] Error:', error);
                pedidoActualizado.historial.push({
                    fecha: new Date().toISOString(),
                    accion: `Error en automatización: ${error.message}`
                });
                saveOrders(pedidosActualizados);
            }
        }
    }, 2000);

    res.json({ success: true, mensaje: 'Pago confirmado. Pedido en procesamiento automático.' });
});

app.get('/api/pedidos', (req, res) => {
    const pedidos = getOrders();
    res.json(pedidos);
});

app.get('/api/test', (req, res) => {
    const productos = getProducts();
    const producto = productos[0];
    
    if (!producto) {
        return res.json({ error: 'No hay productos' });
    }
    
    const pedidoId = uuidv4();
    const pedido = {
        id: pedidoId,
        fecha: new Date().toISOString(),
        cliente: {
            nombre: 'Test',
            apellidos: 'Usuario',
            email: 'alvaromarsolgan@gmail.com',
            telefono: '+34600000000',
            direccion: 'Calle Test 123',
            ciudad: 'Madrid',
            pais: 'España',
            codigoPostal: '28001'
        },
        items: [{
            productoId: producto.id,
            nombre: producto.nombre,
            precio: producto.precioVenta,
            cantidad: 1,
            beneficio: producto.precioVenta - producto.precioProveedor
        }],
        total: producto.precioVenta,
        estado: 'pagado',
        pago: { estado: 'completado', fecha: new Date().toISOString() },
        proveedor: { estado: 'pendiente' },
        historial: [{ fecha: new Date().toISOString(), accion: 'Test' }]
    };
    
    const pedidos = getOrders();
    pedidos.push(pedido);
    saveOrders(pedidos);
    
    producto.ventas += 1;
    saveProducts(productos);
    
    const mensaje = `🚀 NUEVO PEDIDO\n\n📋 ID: ${pedidoId}\n👤 Cliente: Test Usuario\n📧 Email: alvaromarsolgan@gmail.com\n\n📦 PRODUCTO:\n${producto.nombre}\n💰 TOTAL: €${producto.precioVenta}\n\n📍 Dirección: Calle Test 123, Madrid, España`;
    
    fetch(`https://api.telegram.org/bot8791673183:AAE30XKSjFdLZ5c-lwwqa2tcK_0dGYaSFLo/sendMessage?chat_id=-5299638230&text=${encodeURIComponent(mensaje)}`)
        .then(r => console.log('Telegram:', r.status))
        .catch(e => console.log('Error:', e.message));
    
    res.json({ success: true, pedidoId: pedidoId, producto: producto.nombre });
});
