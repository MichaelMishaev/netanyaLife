import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

const size = {
  width: 1200,
  height: 630,
}

// Image generation
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Decorative elements */}
        <div
          style={{
            position: 'absolute',
            top: -80,
            right: -80,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.15)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -100,
            left: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            display: 'flex',
          }}
        />

        {/* Main card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 40,
            padding: 60,
            margin: 60,
            boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
            zIndex: 1,
            maxWidth: 1000,
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: 20,
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 50,
              marginBottom: 30,
              boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
            }}
          >
            💼
          </div>

          {/* Business title placeholder */}
          <div
            style={{
              fontSize: 56,
              fontWeight: 'bold',
              color: '#1e293b',
              marginBottom: 20,
              textAlign: 'center',
              display: 'flex',
            }}
          >
            עסק מקומי בנתניה
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 32,
              color: '#64748b',
              marginBottom: 30,
              display: 'flex',
            }}
          >
            Местный бизнес в Нетании
          </div>

          {/* Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              color: 'white',
              padding: '15px 35px',
              borderRadius: 30,
              fontSize: 24,
              fontWeight: 600,
            }}
          >
            <div style={{ display: 'flex' }}>📍</div>
            <div style={{ display: 'flex' }}>קהילת נתניה</div>
          </div>
        </div>

        {/* Bottom tag */}
        <div
          style={{
            position: 'absolute',
            bottom: 30,
            fontSize: 20,
            color: 'rgba(255, 255, 255, 0.9)',
            fontWeight: 500,
            display: 'flex',
          }}
        >
          מדריך עסקים מקומיים • Местный справочник
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
