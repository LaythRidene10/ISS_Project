// debugger/imageDebugger.js
/**
 * IMAGE DEBUGGER UTILITY
 * Use this to track down image loading issues in your kart builder
 * 
 * Usage:
 * import { ImageDebugger } from '@/debugger/imageDebugger'
 * const debugger = new ImageDebugger()
 * debugger.checkImage('/src/assets/editor/yellow body.png')
 */

export class ImageDebugger {
  constructor() {
    this.loadedImages = new Set()
    this.failedImages = new Set()
    this.testResults = {}
  }

  /**
   * Test if an image URL loads successfully
   */
  async checkImage(url) {
    return new Promise((resolve) => {
      const img = new Image()
      const timeoutId = setTimeout(() => {
        console.error(`⏱️ TIMEOUT: Image took too long to load: ${url}`)
        this.failedImages.add(url)
        resolve({ url, status: 'timeout', loaded: false })
      }, 5000)

      img.onload = () => {
        clearTimeout(timeoutId)
        console.log(`✅ LOADED: ${url}`)
        this.loadedImages.add(url)
        resolve({ url, status: 'success', loaded: true, width: img.width, height: img.height })
      }

      img.onerror = () => {
        clearTimeout(timeoutId)
        console.error(`❌ FAILED: ${url}`)
        this.failedImages.add(url)
        resolve({ url, status: 'error', loaded: false })
      }

      img.src = url
    })
  }

  /**
   * Test multiple images at once
   */
  async checkMultiple(urls) {
    console.log(`\n🔍 Testing ${urls.length} images...\n`)
    const results = await Promise.all(urls.map(url => this.checkImage(url)))
    return results
  }

  /**
   * Get summary report
   */
  getSummary() {
    return {
      totalTested: this.loadedImages.size + this.failedImages.size,
      loaded: this.loadedImages.size,
      failed: this.failedImages.size,
      failedImages: Array.from(this.failedImages),
      loadedImages: Array.from(this.loadedImages),
    }
  }

  /**
   * Print a nice console report
   */
  printReport() {
    const summary = this.getSummary()
    console.log('\n' + '='.repeat(60))
    console.log('📊 IMAGE LOADING REPORT')
    console.log('='.repeat(60))
    console.log(`✅ Loaded: ${summary.loaded}`)
    console.log(`❌ Failed: ${summary.failed}`)
    console.log(`📈 Success Rate: ${summary.totalTested > 0 ? ((summary.loaded / summary.totalTested) * 100).toFixed(1) : 0}%`)
    
    if (summary.failedImages.length > 0) {
      console.log('\n❌ Failed Images:')
      summary.failedImages.forEach(img => console.log(`   - ${img}`))
    }
    console.log('='.repeat(60) + '\n')
  }

  /**
   * Test all paths from COLOR_OPTIONS and PART_OVERLAY_MAP
   */
  async testAllPaths(colorOptions, partOverlayMap, baseImagePath) {
    const allPaths = [baseImagePath]
    
    // Add color overlay paths
    Object.values(colorOptions).forEach(color => {
      if (color.image) allPaths.push(color.image)
    })
    
    // Add part overlay paths
    Object.values(partOverlayMap).forEach(path => {
      if (path) allPaths.push(path)
    })

    return await this.checkMultiple(allPaths)
  }
}

/**
 * LIVE IMAGE DEBUGGER
 * Shows debug info in console for any image element
 */
export function monitorImageElement(imageElement) {
  if (!imageElement) {
    console.warn('No image element provided')
    return
  }

  console.log('📷 Monitoring image element:')
  console.log('   src:', imageElement.src)
  console.log('   alt:', imageElement.alt)
  console.log('   width:', imageElement.width, 'height:', imageElement.height)
  console.log('   complete:', imageElement.complete)
  console.log('   naturalWidth:', imageElement.naturalWidth)
  console.log('   naturalHeight:', imageElement.naturalHeight)

  // Check if image loaded
  if (imageElement.complete && imageElement.naturalWidth > 0) {
    console.log('✅ Image loaded successfully')
  } else if (imageElement.complete) {
    console.log('❌ Image failed to load')
  } else {
    console.log('⏳ Image still loading...')
  }
}

/**
 * DEBUG HELPER: Log all active image URLs on the page
 */
export function debugAllImages() {
  const allImages = document.querySelectorAll('img')
  console.log(`\n🔍 Found ${allImages.length} images on page:\n`)
  
  allImages.forEach((img, index) => {
    const loaded = img.complete && img.naturalWidth > 0
    const status = loaded ? '✅' : '❌'
    console.log(`${status} [${index}] ${img.src || '(no src)'} (${img.alt || 'no alt'})`)
  })
  console.log('\n')
}

/**
 * Check network tab for image requests
 */
export function logNetworkInfo() {
  console.log(`
🌐 NETWORK DEBUGGING:
   - Open DevTools (F12)
   - Go to Network tab
   - Look for failed requests (red/404)
   - Check the URL in the request
   - That URL is what's actually being requested
  `)
}

export default ImageDebugger
