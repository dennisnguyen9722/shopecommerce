import express from 'express'
import path from 'path'
import fs from 'fs'

const router = express.Router()

// load JSON once at startup
const tryPaths = [
  path.join(
    process.cwd(),
    'apps',
    'api',
    'src',
    'data',
    'vietnam-provinces.json'
  ),
  path.join(process.cwd(), 'src', 'data', 'vietnam-provinces.json'),
  '/mnt/data/vietnam-provinces.json' // fallback to uploaded path for dev
]

let provincesData: any[] = []

for (const p of tryPaths) {
  try {
    if (fs.existsSync(p)) {
      const raw = fs.readFileSync(p, 'utf8')
      provincesData = JSON.parse(raw)
      // normalize keys to lowercase short names
      provincesData = provincesData.map((prov: any) => ({
        code: prov.Id ?? prov.id ?? prov.code,
        name: prov.Name ?? prov.name,
        districts:
          (prov.Districts ?? prov.districts ?? prov.children ?? []).map(
            (d: any) => ({
              code: d.Id ?? d.id ?? d.code,
              name: d.Name ?? d.name,
              wards: (d.Wards ?? d.wards ?? []).map((w: any) => ({
                code: w.Id ?? w.id ?? w.code,
                name: w.Name ?? w.name,
                level: w.Level ?? w.level
              }))
            })
          ) || []
      }))
      break
    }
  } catch (err) {
    console.error('Error loading provinces JSON from', p, err)
  }
}

router.get('/provinces', (_req, res) => {
  const list = provincesData.map((p) => ({ code: p.code, name: p.name }))
  res.json(list)
})

router.get('/provinces/:code/districts', (req, res) => {
  const { code } = req.params
  const prov = provincesData.find((p) => String(p.code) === String(code))
  if (!prov) return res.status(404).json({ error: 'Province not found' })
  const districts = (prov.districts || []).map((d: any) => ({
    code: d.code,
    name: d.name
  }))
  res.json(districts)
})

router.get('/districts/:code/wards', (req, res) => {
  const { code } = req.params
  // search across all provinces
  for (const prov of provincesData) {
    const d = (prov.districts || []).find(
      (x: any) => String(x.code) === String(code)
    )
    if (d) {
      const wards = (d.wards || []).map((w: any) => ({
        code: w.code,
        name: w.name,
        level: w.level
      }))
      return res.json(wards)
    }
  }
  res.status(404).json({ error: 'District not found' })
})

export default router
