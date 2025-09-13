// Supabase Edge Function for sending order notifications
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, orderNumber, customerName, status, title, body, totalAmount } = await req.json()

    if (!email || !orderNumber) {
      return new Response(
        JSON.stringify({ error: 'Email and order number are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Email template
    const emailTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Eurodoor - Buyurtma Holati</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
          .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; }
          .status-confirmed { background: #d4edda; color: #155724; }
          .status-processing { background: #fff3cd; color: #856404; }
          .status-shipped { background: #cce5ff; color: #004085; }
          .status-delivered { background: #d1ecf1; color: #0c5460; }
          .status-cancelled { background: #f8d7da; color: #721c24; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏠 Eurodoor</h1>
            <h2>${title}</h2>
          </div>
          
          <div class="content">
            <p>Hurmatli <strong>${customerName}</strong>,</p>
            
            <p>${body}</p>
            
            <div class="order-details">
              <h3>📋 Buyurtma Ma'lumotlari</h3>
              <p><strong>Buyurtma raqami:</strong> ${orderNumber}</p>
              <p><strong>Mijoz:</strong> ${customerName}</p>
              <p><strong>Jami summa:</strong> ${totalAmount.toLocaleString()} so'm</p>
              <p><strong>Holat:</strong> 
                <span class="status-badge status-${status}">
                  ${getStatusText(status)}
                </span>
              </p>
            </div>
            
            <p>Buyurtmangizning barcha o'zgarishlari haqida sizga xabar beramiz.</p>
            
            <p>Savollar bo'lsa, biz bilan bog'laning:</p>
            <ul>
              <li>📞 Telefon: +998 90 123 45 67</li>
              <li>📧 Email: info@eurodoor.uz</li>
              <li>🌐 Veb-sayt: www.eurodoor.uz</li>
            </ul>
          </div>
          
          <div class="footer">
            <p>© 2024 Eurodoor. Barcha huquqlar himoyalangan.</p>
            <p>Bu xabar avtomatik yuborilgan. Iltimos, javob bermang.</p>
          </div>
        </div>
      </body>
      </html>
    `

    // Send email using Resend (you can replace with your preferred email service)
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Eurodoor <noreply@eurodoor.uz>',
        to: [email],
        subject: `Eurodoor - ${title}`,
        html: emailTemplate,
      }),
    })

    if (!emailResponse.ok) {
      console.error('Email sending failed:', await emailResponse.text())
      return new Response(
        JSON.stringify({ error: 'Failed to send email' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const emailResult = await emailResponse.json()
    console.log('Email sent successfully:', emailResult)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notification sent successfully',
        emailId: emailResult.id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in send-order-notification function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'confirmed': 'Tasdiqlandi',
    'processing': 'Tayyorlanmoqda',
    'shipped': 'Yuborildi',
    'delivered': 'Yetkazib berildi',
    'cancelled': 'Bekor qilindi'
  }
  return statusMap[status] || status
}
