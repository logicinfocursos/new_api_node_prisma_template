// src\routes\base.route.js
import express from 'express'

export default class BaseRoute {
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
