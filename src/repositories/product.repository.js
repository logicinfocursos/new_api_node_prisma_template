// src\repositories\product.repository.js
import { PrismaClient } from '@prisma/client'
import BaseRepository from './base.repository.js'

const prisma = new PrismaClient()

export default class ProductRepository extends BaseRepository {
  async findAll() {
    try {
      return await prisma.product.findMany({
        include: { category: true }
      })
    } catch (error) {
      console.error('Error fetching products with category:', error)
      throw error
    }
  }
}
