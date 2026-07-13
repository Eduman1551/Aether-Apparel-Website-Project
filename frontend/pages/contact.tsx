import { useState } from 'react'

const SUBJECTS = [
  { value: 'order', label: 'Order Inquiry' },
  { value: 'product', label: 'Product Question' },
  { value: 'returns', label: 'Returns & Exchanges' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'other', label: 'Other' }
]

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.subject || !form.message) return

    // TODO: wire this up to your backend endpoint when ready
    setSubmitted(true)
    setForm({ name: '', email: '', subject: '', message: '' })
  }

  return (
    <div className="bg-[#FAFAF9] min-h-screen">
      {/* Hero */}
      <div className="bg-white border-b border-[#e5e5e5]">
        <div className="max-w-3000 mx-auto px-6 md:px-10 pt-16 pb-14 text-center">
          <p className="text-xs text-[#7A9E7E] font-semibold tracking-[0.25em] uppercase mb-3">
            Get In Touch
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold text-[#111111] tracking-wide">
            Contact Us
          </h1>
          <p className="text-sm md:text-[15px] text-[#666] mt-4 max-w-lg mx-auto leading-relaxed">
            Have a question about an order, a product, or anything else? Send us
            a message and we&apos;ll get back to you as soon as we can.
          </p>
        </div>
      </div>

      <div className="max-w-300 mx-auto px-6 md:px-10 py-16">
        <div className="bg-white border border-[#e5e5e5] shadow-[0_2px_24px_rgba(0,0,0,0.04)] grid grid-cols-1 lg:grid-cols-5">
          {/* Info column */}
          <div className="lg:col-span-2 bg-[#111111] text-white p-10 md:p-12 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-wide mb-2">
                Contact Information
              </h2>
              <p className="text-sm text-[#bbb] leading-relaxed mb-10">
                Reach out through any of the channels below — our team typically
                responds within 24 hours.
              </p>

              <div className="space-y-7">
                <div className="flex items-start gap-4">
                  <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <svg
                      className="w-4 h-4 text-[#7A9E7E]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </span>
                  <div>
                    <p className="text-[10px] font-medium text-[#999] tracking-widest uppercase mb-1">
                      Email
                    </p>
                    <p className="text-sm text-white">support@yourstore.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <svg
                      className="w-4 h-4 text-[#7A9E7E]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </span>
                  <div>
                    <p className="text-[10px] font-medium text-[#999] tracking-widest uppercase mb-1">
                      Phone
                    </p>
                    <p className="text-sm text-white">+91 98765 43210</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <svg
                      className="w-4 h-4 text-[#7A9E7E]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </span>
                  <div>
                    <p className="text-[10px] font-medium text-[#999] tracking-widest uppercase mb-1">
                      Hours
                    </p>
                    <p className="text-sm text-white leading-relaxed">
                      Monday – Saturday
                      <br />
                      10:00 AM – 7:00 PM IST
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <svg
                      className="w-4 h-4 text-[#7A9E7E]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </span>
                  <div>
                    <p className="text-[10px] font-medium text-[#999] tracking-widest uppercase mb-1">
                      Studio
                    </p>
                    <p className="text-sm text-white leading-relaxed">
                      Udaipur, Rajasthan
                      <br />
                      India
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-12 pt-8 border-t border-white/10">
              <span className="w-2 h-2 rounded-full bg-[#7A9E7E] animate-pulse" />
              <p className="text-xs text-[#bbb]">
                Usually responds within a day
              </p>
            </div>
          </div>

          {/* Form column */}
          <div className="lg:col-span-3 p-10 md:p-12">
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-10">
                <span className="w-14 h-14 rounded-full bg-[#7A9E7E]/10 flex items-center justify-center mb-5">
                  <svg
                    className="w-7 h-7 text-[#7A9E7E]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
                <h2 className="text-xl font-semibold text-[#111111] tracking-wide">
                  Query Sent
                </h2>
                <p className="text-sm text-[#666] mt-2 max-w-xs leading-relaxed">
                  Thanks for reaching out. Our team will get back to you at the
                  email address you provided, shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-7 text-sm border border-[#111111] px-6 py-2.5 text-[#111111] hover:bg-[#111111] hover:text-white transition-colors tracking-wide"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h2 className="text-lg font-semibold text-[#111111] tracking-wide mb-7">
                  Send Us a Message
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="text-xs font-medium text-[#777] tracking-widest uppercase">
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={e => handleChange('name', e.target.value)}
                      placeholder="Your full name"
                      className="w-full text-sm border border-[#e0e0e0] rounded-sm px-3.5 py-3 mt-2 bg-white text-[#111111] placeholder:text-[#bbb] focus:outline-none focus:border-[#7A9E7E] focus:ring-2 focus:ring-[#7A9E7E]/15 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#777] tracking-widest uppercase">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={e => handleChange('email', e.target.value)}
                      placeholder="you@example.com"
                      className="w-full text-sm border border-[#e0e0e0] rounded-sm px-3.5 py-3 mt-2 bg-white text-[#111111] placeholder:text-[#bbb] focus:outline-none focus:border-[#7A9E7E] focus:ring-2 focus:ring-[#7A9E7E]/15 transition-all"
                    />
                  </div>
                </div>

                <div className="mb-5">
                  <label className="text-xs font-medium text-[#777] tracking-widest uppercase">
                    Subject
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                    {SUBJECTS.map(s => (
                      <button
                        type="button"
                        key={s.value}
                        onClick={() => handleChange('subject', s.value)}
                        className={`text-xs px-3 py-2.5 border rounded-sm text-left transition-colors ${
                          form.subject === s.value
                            ? 'border-[#111111] bg-[#111111] text-white'
                            : 'border-[#e0e0e0] text-[#555] hover:border-[#111111] hover:text-[#111111]'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-7">
                  <label className="text-xs font-medium text-[#777] tracking-widest uppercase">
                    Message
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={e => handleChange('message', e.target.value)}
                    placeholder="Tell us how we can help..."
                    className="w-full text-sm border border-[#e0e0e0] rounded-sm px-3.5 py-3 mt-2 bg-white text-[#111111] placeholder:text-[#bbb] focus:outline-none focus:border-[#7A9E7E] focus:ring-2 focus:ring-[#7A9E7E]/15 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="group flex items-center gap-2 bg-[#111111] text-white text-sm font-medium px-7 py-3.5 rounded-sm hover:bg-[#7A9E7E] transition-colors tracking-wide"
                >
                  Send Message
                  <svg
                    className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
