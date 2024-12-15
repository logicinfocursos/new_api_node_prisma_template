// src\controllers\base.controller.js
import { getCodeUtil } from '../utils/index.js'

export default class BaseController {
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
    // veriricar se data contém um campo id, se existir, retornar erro
    if (req.body.id && req.body.id !== '') {
      return res.status(400).json({ error: 'ID não pode ser informado para se criar um novo registro' })
    }

    // verificar se data contém o campo code, se existir, verificar se já existe um registro com o mesmo code
    if (req.body.code) {
      const item = await this.repository.findByCode(req.body.code)
      if (item) {
        return res.status(400).json({ error: 'Código já cadastrado!' })
      }
    } else {
      req.body.code = getCodeUtil()
    }

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
