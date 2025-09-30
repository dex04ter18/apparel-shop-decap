// Stripeを読み込む（秘密鍵はNetlifyの環境変数から）
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  try {
    // フロントから送られてきたデータを受け取る
    const { cart } = JSON.parse(event.body || "{}");

    if (!cart || cart.length === 0) {
      return { statusCode: 400, body: "カートが空です" };
    }

    // Stripe用の line_items に変換
    const line_items = cart.map(item => ({
      price_data: {
        currency: "jpy",
        product_data: {
          name: item.title || "商品",  // 商品名
        },
        unit_amount: Number(item.price) || 0, // 金額（1円単位）
      },
      quantity: item.qty || 1, // 数量
    }));

    // Checkoutセッション作成
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${process.env.URL}/success.html`,
      cancel_url: `${process.env.URL}/cancel.html`,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ id: session.id }),
    };
  } catch (err) {
    console.error("Error in create-checkout:", err);
    return { statusCode: 500, body: err.message };
  }
};
