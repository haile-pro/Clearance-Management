import React from 'react'
import { motion } from 'framer-motion'

export default function MagicalLoader() {
  const containerVariants = {
    start: {
      transition: {
        staggerChildren: 0.2,
      },
    },
    end: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const circleVariants = {
    start: {
      y: '0%',
    },
    end: {
      y: '100%',
    },
  }

  const circleTransition = {
    duration: 0.5,
    yoyo: Infinity,
    ease: 'easeInOut',
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <motion.div
        className="flex justify-around w-16"
        variants={containerVariants}
        initial="start"
        animate="end"
      >
        {[...Array(3)].map((_, i) => (
          <motion.span
            key={i}
            className="block w-3 h-3 bg-blue-500 rounded-full"
            variants={circleVariants}
            transition={circleTransition}
          />
        ))}
      </motion.div>
    </div>
  )
}