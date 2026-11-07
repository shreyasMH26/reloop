import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { RefreshCw, Home, ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-cream-50 flex flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full"
      >
        {/* Animated loop icon */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-sage-100 mb-6"
        >
          <RefreshCw size={40} className="text-sage-500" />
        </motion.div>

        {/* 404 */}
        <h1 className="text-8xl font-black text-sage-500 leading-none">404</h1>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-charcoal-900 mt-4 mb-3">
          Page not found
        </h2>

        {/* Message */}
        <p className="text-charcoal-500 leading-relaxed mb-8">
          Looks like this page went out of circulation. The link you followed may
          be broken, or the page may have been removed.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-sage-500 text-white rounded-xl font-semibold hover:bg-sage-600 transition-colors shadow w-full sm:w-auto justify-center"
          >
            <Home size={18} />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 border border-charcoal-900 text-charcoal-900 rounded-xl font-semibold hover:bg-charcoal-900 hover:text-white transition-colors w-full sm:w-auto justify-center"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>
      </motion.div>
    </div>
  )
}
