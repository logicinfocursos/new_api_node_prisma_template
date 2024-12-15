// src\routes\app.router.js
import BaseRoute from './base.route.js'
import BaseController from '../controllers/base.controller.js'
import ProductRepository from '../repositories/product.repository.js'
import CategoryRepository from '../repositories/category.repository.js'
import BaseRepository from '../repositories/base.repository.js'


// relacione aqui todas as entidades do projeto
const config = { entities: ['product', 'category', 'user'] }

const _API_PATH_PREFIX_ = process.env.API_PATH_PREFIX || '/api'
console.log('API_PATH_PREFIX:', _API_PATH_PREFIX_)

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
      this.app.use(`/${_API_PATH_PREFIX_}/${entity}`, route.router)
    }
  }


  // se existirem repositórios específicos para alguma entidade, 
  // onde será necessário sobrescrever os métodos de base.repository, 
  // adicione aqui
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

export default AppRouter
