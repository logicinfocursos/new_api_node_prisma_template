import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const prisma = new PrismaClient()

app.use(cors())
app.use(express.json())

const port = process.env.API_PORT || 3001

const config = { entities: ['product', 'category', 'user'] }

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`)
})

class AppRouter {
  constructor(app) {
    this.app = app
    this.routes()
  }

  routes() {
    for (const entity of config.entities) {
      const repository = this.getRepository(entity)
      const controller = new BaseController(repository)
      const route = new BaseRoute(controller)
      this.app.use(`/${entity}`, route.router)
    }
  }

  getRepository(entity) {
    switch (entity) {
      case 'product':
        return new ProductRepository(entity)
      case 'category':
        return new CategoryRepository(entity)
      default:
        return new BaseRepository(entity)
    }
  }
}

class BaseRepository {
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

  async findByCode(code) {
    return await prisma[this.entity].findUnique({ where: { code: code } })
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

class ProductRepository extends BaseRepository {
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

class CategoryRepository extends BaseRepository {
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

class BaseController {
  constructor(repository) {
    this.repository = repository
  }

  async getAll(req, res) {
    try {
      const items = await this.repository.findAll()
      res.json(items)
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }

  async getByCode(req, res) {
    // veriricar se id está vazio, se não estiver vazio, mas não for do tipo number, redirecionar para a rota de getByCode
    if (!req.params.code || isNaN(req.params.code) || req.params.code === '') {
      res.status(400).json({ error: 'code não informado' })
      return
    }
    // verificar se o id for do tipo number, redirecionar para a rota de getByCode
    if (typeof req.params.code === 'number' && req.params.code !== '') {
      this.getById(req, res)
      return
    }
    try {
      const item = await this.repository.findByCode(req.params.code)
      console.log('>>> getByCode', item)
      res.json(item)
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }

  async getById(req, res) {
    // veriricar se id está vazio, se não estiver vazio, mas não for do tipo number, redirecionar para a rota de getByCode
    if (!req.params.id || isNaN(req.params.id) || req.params.id === '0' || req.params.id === '') {
      res.status(400).json({ error: 'ID não informado' })
      return
    }
    // verificar se o id for do tipo string, redirecionar para a rota de getByCode
    if (typeof req.params.id === 'string' && req.params.id !== '') {
      this.getByCode(req, res)
      return
    }

    try {
      const item = await this.repository.findById(req.params.id)
      console.log('>>> getById', item)
      res.json(item)
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }

  async create(req, res) {
    // verificar se o body está vazio ou contém apenas propriedades vazias
    if (!req.body || (Array.isArray(req.body) && req.body.length === 0)) {
      res.status(400).json({ error: 'Request body is empty' })
      return
    }

    // verificar se o body contém uma propriedade "code" e se existir checar se já existe um registro com esse código
    if (req.body.code) {
      const item = await this.repository.findByCode(req.body.code)
      if (item) {
        res.status(400).json({ error: 'Erro ao tentar cadastrar!!! Já existe um registro com esse código' })
        return
      }
    }

    // verificar se o body contém uma propriedade "id" e se existir checar se já existe um registro com esse id
    if (req.body.id) {
      const item = await this.repository.findById(req.body.id)
      if (item) {
        res.status(400).json({ error: 'Erro ao tentar cadastrar!!! Já existe um registro com esse id' })
        return
      }
    }

    try {
      const item = await this.repository.create(req.body)
      res.json(item)
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }

  async update(req, res) {
    //  try {
    // antes de atualizar um registro, verificar se ele existe
    const item = await this.repository.findById(req.params.id)

    console.log('>>> update item', item)

    if (!item) {
      res.status(404).json({ error: 'Registro não encontrado' })
      return
    } else {
      const result = await this.repository.update(item.id, req.body)
      res.json(result)
    }
    //   } catch (error) {
    //      res.status(500).json({ error: '>>> Internal Server Error ***' })
    //   }
  }

  async delete(req, res) {
    try {
      await this.repository.delete(req.params.id)
      res.sendStatus(204)
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }
}

class BaseRoute {
  constructor(controller) {
    this.controller = controller
    this.router = express.Router()
    this.routes()
  }

  routes() {
    this.router.get('/', this.controller.getAll.bind(this.controller))
    this.router.get('/:code', this.controller.getByCode.bind(this.controller))
    this.router.get('/:id', this.controller.getById.bind(this.controller))
    this.router.post('/', this.controller.create.bind(this.controller))
    this.router.put('/:id', this.controller.update.bind(this.controller))
    this.router.delete('/:id', this.controller.delete.bind(this.controller))
  }
}

new AppRouter(app)
