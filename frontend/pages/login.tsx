import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

type LoginPageProps = {
  setUser?: (user: any) => void
}

export default function LoginPage({ setUser }: LoginPageProps) {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', 
          body: JSON.stringify(form)
        }
      )

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Login failed')
        return
      }

      if (setUser) {
        setUser(data.user)
      }
      router.push('/products')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center bg-white px-6 mb-auto mt-20">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-[#111111] text-center mb-2">
          Welcome Back
        </h1>
        <p className="text-sm text-[#555] text-center mb-8">
          Log in to your Aether Apparel account
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[#111111] mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border border-[#e0e0e0] px-3 py-2 text-sm focus:outline-none focus:border-[#7A9E7E]"
            />
          </div>

          <div>
            <label className="block text-sm text-[#111111] mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full border border-[#e0e0e0] px-3 py-2 text-sm focus:outline-none focus:border-[#7A9E7E]"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#111111] text-white py-2 text-sm font-medium hover:bg-[#7A9E7E] transition-colors disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-sm text-[#555] text-center mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-[#7A9E7E] font-medium">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
