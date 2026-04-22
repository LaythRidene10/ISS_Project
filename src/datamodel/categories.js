import crossKartImage from '@/assets/categories/cross-kart-custom.jpg'
import dailyKartImage from '@/assets/categories/daily-kart-model.png'
import juniorKartImage from '@/assets/categories/junior-kart-model.jpg'
import proKartImage from '@/assets/categories/pro-kart-custom.webp'
import raceKartImage from '@/assets/categories/race-kart-model.png'
import streetKartImage from '@/assets/categories/street-kart-model.jpg'

const categories = [
  {
    slug: 'cross-kart',
    name: 'Cross Kart',
    configuration: 'Off road machine',
    image: crossKartImage,
    description: 'Cross karts are lightweight off-road racers built for dirt, gravel, and rough terrain. They use strong frames, high ground clearance, and long-travel suspension to stay fast and stable away from the track.',
  },
  {
    slug: 'street-kart',
    name: 'Street Kart',
    configuration: 'Casual style',
    image: streetKartImage,
    description: 'Street karts are designed for fun recreational driving with a more relaxed setup. They focus on comfort, control, and easy handling for casual sessions and urban-style kart experiences.',
  },
  {
    slug: 'race-kart',
    name: 'Race Kart',
    configuration: 'Semi-pro',
    image: raceKartImage,
    description: 'Race karts are made for circuit performance, with low ride height, precise steering, and a chassis tuned for speed. They are ideal for competitive drivers who want sharp handling and strong lap times.',
  },
  {
    slug: 'junior-kart',
    name: 'Junior Kart',
    configuration: 'For kids',
    image: juniorKartImage,
    description: 'Junior karts are built for younger drivers, with smaller dimensions and a balanced setup that is easier to control. They provide a safe and exciting entry point into karting and driver development.',
  },
  {
    slug: 'daily-kart',
    name: 'Daily Kart',
    configuration: 'For everyday fun',
    image: dailyKartImage,
    description: 'Daily karts are versatile models intended for regular leisure use. They blend simple maintenance, dependable performance, and comfortable driving for frequent rides and family fun.',
  },
  {
    slug: 'pro-kart',
    name: 'Pro Kart',
    configuration: 'Full Custom',
    image: proKartImage,
    description: 'Pro karts are high-performance machines aimed at experienced drivers and advanced setups. They support stronger tuning, premium components, and track-focused behavior for top-level performance.',
  },
]

export function getAllCategories () {
  return categories
}

export function getCategoryBySlug (slug) {
  return categories.find(category => category.slug === slug) || null
}
