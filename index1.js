import express from 'express'
import cors from 'cors'

const app = express()

app.use(cors())
app.use(express.json())

const port = 3001

const config = { entities: ['product', 'category'] }

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

class BaseRoute {
  constructor(controller) {
    this.router = express.Router()
    this.controller = controller
    this.setRoutes()
  }

  getAll = (request, response) => {
    this.controller.getAll(request, response)
  }

  getById = (request, response) => {
    this.controller.getById(request, response)
  }

  create = (request, response) => {
    this.controller.create(request, response)
  }

  update = (request, response) => {
    this.controller.update(request, response)
  }

  erase = (request, response) => {
    this.controller.erase(request, response)
  }

  setRoutes() {
    this.router.get('/', this.getAll)
    this.router.get('/:id?', this.getById)
    this.router.post('/', this.create)
    this.router.put('/:id?', this.update)
    this.router.patch('/:id?', this.update)
    this.router.delete('/:id?', this.erase)
  }
}

class BaseController {
  constructor(repository) {
    this.repository = repository
  }

  async getAll(_, response) {
    try {
      const result = await this.repository.getAll()
      const objectList = result.map(object => this.repository.mapObject(object))

      response.status(200).send(objectList)
    } catch (e) {
      response.status(400).send(e)
    }
  }

  async getById(request, response) {
    try {
      const result = await this.repository.getById(request.params.id)
      const mappedObject = this.repository.mapObject(result)

      response.status(200).send(mappedObject)
    } catch (e) {
      response.status(400).send(e)
    }
  }

  async create(request, response) {
    response.status(200).send(await this.repository.create(request.body))
  }

  async update(request, response) {
    response.status(200).send(await this.repository.update(request.params.id, request.body))
  }

  async erase(request, response) {
    response.status(200).send(await this.repository.erase(request.params.id))
  }
}

class BaseRepository {
  db = {
    product: [
      {
        id: 1,
        name: 'Produto 1',
        price: 100,
        categoryid: 1
      },
      {
        id: 2,
        name: 'Produto 2',
        price: 200,
        categoryid: 2
      }
    ],
    category: [
      {
        id: 1,
        name: 'Categoria 1'
      },
      {
        id: 2,
        name: 'Categoria 2**'
      }
    ]
  }

  constructor(entity) {
    this.entity = entity
  }

  async getAll() {
    return this.db[this.entity]
  }

  async getById(id) {
    return this.db[this.entity].find(object => object.id === Number(id))
  }

  async create(data) {
    data.id = this.db[this.entity].length + 1
    this.db[this.entity].push(data)

    return data
  }

  async update(id, data) {
    const index = this.db[this.entity].findIndex(object => object.id === id)

    this.db[this.entity][index] = {
      ...this.db[this.entity][index],
      ...data
    }

    return this.db[this.entity][index]
  }

  async erase(id) {
    const index = this.db[this.entity].findIndex(object => object.id === id)
    this.db[this.entity].splice(index, 1)
    return this.db[this.entity]
  }

  mapObject(object) {
    let newObject = {}
    Object.keys(object).forEach(key => {
      newObject[key] = object[key]
    })
    return newObject
  }
}

class Product {
  constructor(id, name, price, categoryid) {
    this.id = id
    this.name = name
    this.price = price
    this.categoryid = categoryid
  }
}

class Category {
  constructor(id, name) {
    this.id = id
    this.name = name
  }
}

new AppRouter(app)
