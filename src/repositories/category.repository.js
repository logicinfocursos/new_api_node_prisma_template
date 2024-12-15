// src\repositories\category.repository.js
import { PrismaClient } from '@prisma/client'
import BaseRepository from './base.repository.js'

const prisma = new PrismaClient()

export default class CategoryRepository extends BaseRepository {
  async findAll() {
    try {
      return await prisma.category.findMany({
        include: { products: true }
      })
    } catch (error) {
      console.error('Error fetching categories with products:', error)
      throw error
    }
  }
}
