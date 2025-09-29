// Stripeを読み込む（秘密鍵はNetlifyの環境変数から）
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  try {
    // StripeのCheckoutセッションを作成
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"], // クレジットカード払い
      line_items: [
        {
          price_data: {
            currency: "jpy", // 日本円
            product_data: {
              name: "テスト商品",
            },
            unit_amount: 1000, // 金額（1000円）単位は「円」ではなく「最小単位（ここでは1円）」
          },
          quantity: 1,
        },
      ],
      mode: "payment", // 単発購入
      success_url: `${process.env.URL}/success.html`, // 成功時の遷移先
      cancel_url: `${process.env.URL}/cancel.html`,   // キャンセル時の遷移先
    });

    // フロントにセッションIDを返す
    return {
      statusCode: 200,
      body: JSON.stringify({ id: session.id }),
    };
  } catch (err) {
    return { statusCode: 500, body: err.message };
  }
};
