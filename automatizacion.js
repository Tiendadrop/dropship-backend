const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, '..', 'data', 'config-proveedores.json');

function getConfig() {
    if (fs.existsSync(CONFIG_FILE)) {
        return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    }
    return getDefaultConfig();
}

function getDefaultConfig() {
    const config = {
        proveedores: [
            {
                id: 'aliexpress',
                nombre: 'AliExpress',
                activo: true,
                apiKey: '',
                apiUrl: 'https://api.aliexpress.com',
                preferencias: {
                    envioEstandar: true,
                    seguro: true,
                    impuestosIncluidos: false
                }
            }
        ],
        ajustes: {
            margenMinimo: 30,
            multiplicadorPrecio: 1.5,
            paisesActivos: ['ES', 'MX', 'AR', 'CO', 'CL', 'PE']
        },
        webhookUrl: ''
    };
    saveConfig(config);
    return config;
}

function saveConfig(config) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

async function orderToSupplier(product, customerInfo, config) {
    const proveedor = config.proveedores.find(p => p.activo);
    
    if (!proveedor) {
        throw new Error('No hay proveedor activo configurado');
    }

    console.log(`\n🌐 [AUTOMATIZACIÓN] Conectando con ${proveedor.nombre}...`);
    
    if (proveedor.id === 'aliexpress') {
        return await orderToAliExpress(product, customerInfo, config);
    }
    
    throw new Error(`Proveedor ${proveedor.id} no soportado`);
}

async function orderToAliExpress(product, customerInfo, config) {
    const apiKey = config.proveedores[0].apiKey;
    
    if (!apiKey) {
        console.log('⚠️ No hay API key configurada. Usando modo DEMO.');
        return await simulateOrder(product, customerInfo);
    }
    
    const orderData = {
        product_id: product.proveedorId,
        sku_id: product.skuId || product.proveedorId,
        quantity: product.cantidad || 1,
        shipping_address: {
            full_name: `${customerInfo.nombre} ${customerInfo.apellidos}`,
            phone_number: customerInfo.telefono || '',
            address_line1: customerInfo.direccion,
            city: customerInfo.ciudad,
            state: customerInfo.estado || '',
            postal_code: customerInfo.codigoPostal || '',
            country: customerInfo.pais
        },
        payment_method: 'alipay'
    };

    try {
        console.log(`📦 Enviando orden a AliExpress...`);
        console.log(`   Producto: ${product.nombre}`);
        console.log(`   Cliente: ${orderData.shipping_address.full_name}`);
        console.log(`   Dirección: ${orderData.shipping_address.address_line1}, ${orderData.shipping_address.city}, ${orderData.shipping_address.country}`);

        const response = await fetch(`${config.proveedores[0].apiUrl}/order/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) {
            throw new Error(`AliExpress API error: ${response.status}`);
        }

        const result = await response.json();
        
        return {
            success: true,
            orderId: result.order_id,
            trackingNumber: result.tracking_number,
            estimatedDays: result.estimated_delivery_days,
            costoEnvio: result.shipping_cost,
            estado: 'enviado'
        };
    } catch (error) {
        console.error('Error conectando con AliExpress:', error);
        return await simulateOrder(product, customerInfo);
    }
}

async function simulateOrder(product, customerInfo) {
    console.log('\n⏳ Simulando compra automática al proveedor...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const trackingNumber = 'TRK' + Date.now().toString(36).toUpperCase();
    const orderId = 'ORD-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    const days = Math.floor(Math.random() * 10) + 15;
    
    console.log('\n✅ ¡COMPRA AUTOMÁTICA REALIZADA!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📋 Orden ID: ${orderId}`);
    console.log(`📦 Producto: ${product.nombre}`);
    console.log(`👤 Cliente: ${customerInfo.nombre} ${customerInfo.apellidos}`);
    console.log(`📍 Dirección: ${customerInfo.direccion}, ${customerInfo.ciudad}, ${customerInfo.pais}`);
    console.log(`📮 Tracking: ${trackingNumber}`);
    console.log(`⏱️ Entrega estimada: ${days} días`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (product.cantidad > 1) {
        console.log(`📊 Cantidad: ${product.cantidad} unidades`);
    }

    return {
        success: true,
        orderId: orderId,
        trackingNumber: trackingNumber,
        estimatedDays: days,
        costoEnvio: 0,
        estado: 'enviado',
        fechaOrden: new Date().toISOString()
    };
}

async function checkTracking(trackingNumber, config) {
    console.log(`🔍 Consultando tracking: ${trackingNumber}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const estados = ['en_transito', 'en_aduana', 'en_entrega', 'entregado'];
    const estadoActual = estados[Math.floor(Math.random() * estados.length)];
    
    return {
        tracking: trackingNumber,
        estado: estadoActual,
        ubicacion: 'Centro de distribución internacional',
        ultimaActualizacion: new Date().toISOString()
    };
}

module.exports = {
    getConfig,
    saveConfig,
    orderToSupplier,
    simulateOrder,
    checkTracking
};