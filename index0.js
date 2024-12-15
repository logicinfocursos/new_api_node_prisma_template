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

const config = { "entities": ["product", "category", "user"] }

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

// está ocorrendo um conflito nas buscas por id e code, corrigir
class BaseController {
    constructor(repository) {
        this.repository = repository
    }

    async getAll(req, res) {
        try {
            const items = await this.repository.findAll()
            res.json(items)
        } catch (error) {
            res.status(500).json({ error: 'erro no servidor' })
        }
    }

    async getListByKey(req, res) {
        try {
            const items = await this.repository.findByField(req.params.field, req.params.key)

            res.json(items)
        } catch (error) {
            res.status(500).json({ error: 'controller - erro no servidor' })
            F
        }
    }

    async getByCode(req, res) {
        try {
            const item = await this.repository.findByCode(req.params.code)
            if (item) {
                res.json(item)
            } else {
                res.status(404).json({ error: 'Registro não encontrado!' })
            }
        } catch (error) {
            res.status(500).json({ error: 'erro no servidor' })
        }
    }

    async getById(req, res) {
        const id = req.params.id
        if (isNaN(id)) {
            return this.getByCode(req, res)
        }

        try {
            const item = await this.repository.findById(id)
            if (item) {
                res.json(item)
            } else {
                res.status(404).json({ error: 'Not Found' })
            }
        } catch (error) {
            res.status(500).json({ error: 'erro no servidor' })
        }
    }

    async getByField(req, res) {
        try {
            const items = await this.repository.findByField(req.params.field, req.params.value)
            res.json(items)
        } catch (error) {
            res.status(500).json({ error: 'erro no servidor' })
        }
    }

    async create(req, res) {
        try {
            const item = await this.repository.create(req.body)
            res.json(item)
        } catch (error) {
            res.status(500).json({ error: 'erro no servidor' })
        }
    }

    async update(req, res) {
        try {
            const item = await this.repository.update(req.params.id, req.body)
            res.json(item)
        } catch (error) {
            res.status(500).json({ error: 'erro no servidor' })
        }
    }

    async delete(req, res) {
        try {
            await this.repository.delete(req.params.id)
            res.sendStatus(204)
        } catch (error) {
            res.status(500).json({ error: 'erro no servidor' })
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
        this.router.get('/:key?/:field?', this.controller.getListByKey.bind(this.controller))
        this.router.post('/', this.controller.create.bind(this.controller))
        this.router.put('/:id', this.controller.update.bind(this.controller))
        this.router.delete('/:id', this.controller.delete.bind(this.controller))
    }
}

new AppRouter(app)