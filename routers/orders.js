const {Order} = require('../models/order');
const express = require('express');
const { OrderItem } = require('../models/order-item');
const router = express.Router();


 
router.get(`/`, async (req, res) =>{
    const orderList = await Order.find().populate('user', 'name').sort({'dateOrdered': -1});
    if(!orderList){res.status(500).json({succsess: false})}
    res.send(orderList);
})


//get specific item
router.get(`/:id`, async (req, res) =>{
    const order = await Order.findById(req.params.id).populate('user', 'name').populate({path: 'orderItems', populate: {path: 'product', populate: 'category'}})
    if(!order){return res.status(500).json({succsess: false})}
    res.send(order);
})

//add item
router.post(`/`, async (req, res)=>{
    const orderItemsIds = Promise.all(req.body.orderItems.map(async orderItem =>{ 
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        });
        newOrderItem = await newOrderItem.save();

       return newOrderItem._id;
    }))
    const orderItemsIdsResolved = await orderItemsIds;

    const totalPrices = await Promise.all(orderItemsIdsResolved.map(async(orderItemsId)=>{
        const orderItem = await OrderItem.findById(orderItemsId).populate('product','price');
        const totalPrice = orderItem.product.price * orderItem.quantity;
        console.log('totalPrice = ', totalPrice)
       // console.log('totalPrice = ', orderItem.product.product);
        return totalPrice;
    }))

    const totalPrice = totalPrices.reduce((a,b)=>a+b,0); 

    let order = new Order({
        orderItems: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        phone: req.body.phone,
        country: req.body.country,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user,
    })
    order = await order.save();
    if(!order) return res.status(500).send('The order cannot be created')
    res.send(order);
})

//update
router.put('/:id',async (req, res)=> {
    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status
        },
        { new: true}
    )

    if(!order)
    return res.status(400).send('the order cannot be update!')

    res.send(order);
})

router.delete(`/:id`, (req, res) =>{
    Order.findByIdAndRemove(req.params.id).then(async order =>{
        if(Order){await order.orderItems.map(async orderItem=>{
            await OrderItem.findByIdAndRemove(orderItem)
        })
        return res.status(200).json({succsess: true, message: 'The order has been deleted'})}
        else{return res.status(404).json({succsess: false, message: 'The order has not been deleted'})}
    }).catch(err=>{return res.status(500).json({succsess: false, error: err})})
   
})


router.get(`/get/totalsales`, async (req, res)=> {
    const totalSales = await Order.aggregate([{$group: {_id: null, totalsales: {$sum: '$totalPrice'}}}])
    if(!totalSales){return res.status(400).send('the order sales cannot be generated!') }
    res.send({totalsales: totalSales.pop().totalsales})
})

router.get(`/get/count`, async (req, res) => {
    const orderCount = await Order.count();
    if (!orderCount) {res.status(500).json({ success: false });}
    res.send({orderCount: orderCount});
  });


router.get(`/get/userorders/:userid`, async (req, res)=>{
    const userOrderList = await Order.find({user: req.params.userid}).populate({
        path: 'orderItems', populate: {path: 'product', populate: 'category'}}).sort({'dateOrderd': -1});
        if(!userOrderList){res.status(500).json({succsess: false})}
    res.send(userOrderList);
})


module.exports = router;