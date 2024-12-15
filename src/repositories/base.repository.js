// src\repositories\base.repository.js
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default class BaseRepository {
  constructor(entity) {
    this.entity = entity
  }

  async findAll() {
    try {
      return await prisma[this.entity].findMany()
    } catch (error) {
      console.error(`Error fetching all ${this.entity}:`, error)
      throw error
    }
  }

  async findByField(field, value) {
    try {
      return await prisma[this.entity].findMany({ where: { [field]: value } })
    } catch (error) {
      console.error(`Error fetching ${this.entity} by field:`, error)
      throw error
    }
  }

  async findByCode(code) {
    try {
      return await prisma[this.entity].findUnique({ where: { code: code } })
    } catch (error) {
      console.error(`Error fetching ${this.entity} by code:`, error)
      throw error
    }
  }

  async findById(id) {
    try {
      return await prisma[this.entity].findUnique({ where: { id: Number(id) } })
    } catch (error) {
      console.error(`Error fetching ${this.entity} by ID:`, error)
      throw error
    }
  }

  async create(data) {
    try {
      return await prisma[this.entity].create({ data })
    } catch (error) {
      console.error(`Error creating ${this.entity}:`, error)
      throw error
    }
  }

  async update(id, data) {
    try {
      return await prisma[this.entity].update({ where: { id: Number(id) }, data })
    } catch (error) {
      console.error(`Error updating ${this.entity}:`, error)
      throw error
    }
  }

  async delete(id) {
    try {
      return await prisma[this.entity].delete({ where: { id: Number(id) } })
    } catch (error) {
      console.error(`Error deleting ${this.entity}:`, error)
      throw error
    }
  }
}
