import sharp from 'sharp'
import { readFileSync } from 'fs'

const svgContent = readFileSync('./public/icons/icon-192.svg')

// Generate apple-touch-icon.png (180x180 for iOS)
await sharp(Buffer.from(svgContent))
  .resize(180, 180)
  .png()
  .toFile('./public/apple-touch-icon.png')

// Generate pwa-192x192.png
await sharp(Buffer.from(svgContent))
  .resize(192, 192)
  .png()
  .toFile('./public/pwa-192x192.png')

// Read 512x512 SVG for larger icons
const svgContent512 = readFileSync('./public/icons/icon-512.svg')

// Generate pwa-512x512.png
await sharp(Buffer.from(svgContent512))
  .resize(512, 512)
  .png()
  .toFile('./public/pwa-512x512.png')

console.log('Icons generated!')
