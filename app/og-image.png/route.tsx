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
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            left: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -150,
            right: -150,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            display: 'flex',
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 80,
            textAlign: 'center',
            zIndex: 1,
          }}
        >
          {/* Logo/Icon */}
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: 30,
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 60,
              marginBottom: 40,
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
          >
            📍
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 'bold',
              color: 'white',
              marginBottom: 20,
              textShadow: '0 4px 8px rgba(0,0,0,0.2)',
              display: 'flex',
            }}
          >
            קהילת נתניה
          </div>

          {/* Subtitle in Hebrew */}
          <div
            style={{
              fontSize: 42,
              color: 'rgba(255, 255, 255, 0.95)',
              marginBottom: 10,
              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
              display: 'flex',
            }}
          >
            מדריך עסקים מקומיים בנתניה
          </div>

          {/* Subtitle in Russian */}
          <div
            style={{
              fontSize: 32,
              color: 'rgba(255, 255, 255, 0.9)',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
              display: 'flex',
            }}
          >
            Местный бизнес-справочник Нетании
          </div>
        </div>

        {/* Bottom badge */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 15,
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '15px 30px',
            borderRadius: 50,
            backdropFilter: 'blur(10px)',
          }}
        >
          <div
            style={{
              fontSize: 24,
              color: 'white',
              fontWeight: 600,
              display: 'flex',
            }}
          >
            חיפוש לפי שכונות • Поиск по районам
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
