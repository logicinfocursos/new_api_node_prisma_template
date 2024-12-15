import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'

const app = express()
const prisma = new PrismaClient()

app.use(cors())
app.use(express.json())

const port = 3001

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
      const repository = new BaseRepository(entity)
      const controller = new BaseController(repository)
      const route = new BaseRoute(controller)
      this.app.use(`/${entity}`, route.router)
    }
  }
}

class BaseRepository {
  constructor(entity) {
    this.entity = entity
  }

  async findAll() {
    return await prisma[this.entity].findMany()
  }

  async findById(id) {
    return await prisma[this.entity].findUnique({ where: { id: Number(id) } })
  }

  async create(data) {
    return await prisma[this.entity].create({ data })
  }

  async update(id, data) {
    return await prisma[this.entity].update({ where: { id: Number(id) }, data })
  }

  async delete(id) {
    return await prisma[this.entity].delete({ where: { id: Number(id) } })
  }
}

class BaseController {
  constructor(repository) {
    this.repository = repository
  }

  async getAll(req, res) {
    const items = await this.repository.findAll()
    res.json(items)
  }

  async getById(req, res) {
    const item = await this.repository.findById(req.params.id)
    res.json(item)
  }

  async create(req, res) {
    const item = await this.repository.create(req.body)
    res.json(item)
  }

  async update(req, res) {
    const item = await this.repository.update(req.params.id, req.body)
    res.json(item)
  }

  async delete(req, res) {
    await this.repository.delete(req.params.id)
    res.sendStatus(204)
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
    this.router.get('/:id', this.controller.getById.bind(this.controller))
    this.router.post('/', this.controller.create.bind(this.controller))
    this.router.put('/:id', this.controller.update.bind(this.controller))
    this.router.delete('/:id', this.controller.delete.bind(this.controller))
  }
}

new AppRouter(app)
