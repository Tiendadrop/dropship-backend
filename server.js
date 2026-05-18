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
