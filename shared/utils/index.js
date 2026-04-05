const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)

const pick = (obj, keys) => {
  if (!isObject(obj)) return {}
  const out = {}
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) out[key] = obj[key]
  }
  return out
}

const toNumber = (value, fallback = 0) => {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : fallback
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const formatCurrency = (amount, currency = 'INR', locale = 'en-IN') => {
  const n = toNumber(amount, 0)
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(n)
}

module.exports = {
  clamp,
  formatCurrency,
  isObject,
  pick,
  toNumber
}