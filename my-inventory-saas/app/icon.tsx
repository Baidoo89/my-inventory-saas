import { ImageResponse } from 'next/og'
 
// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'
 
// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg 
          width="32" 
          height="32" 
          viewBox="0 0 40 40" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background: Indigo-600 #4f46e5 */}
          <rect width="40" height="40" rx="10" fill="#4f46e5" />
          
          {/* SF Monogram */}
          <path 
            d="M12 14C12 11.5 14 10 16.5 10H20C22.5 10 24 11.5 24 14C24 16.5 22 17 20 17H16C14 17 12 17.5 12 20C12 22.5 14 24 16.5 24H20" 
            stroke="white" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d="M28 10H24V24" 
            stroke="white" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d="M24 17H27" 
            stroke="white" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}