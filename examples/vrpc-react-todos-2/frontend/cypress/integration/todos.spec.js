/* global describe, it, cy, before, context */

/// <reference types="cypress" />

const TODO_ITEM_ONE = 'Cook coffee'
const TODO_ITEM_TWO = 'Clean the kitchen'

describe('Todo App', () => {
  before(() => {
    cy.visit('/')
    cy.get('h1').contains('Todo List')
  })

  context('When page is initially opened', () => {
    it('should show input form', () => {
      cy.get('form').within(() => {
        cy.get('input').should('be.visible')
        cy.get('button').should('be.visible')
      })
    })
    it('should display an empty todo list', () => {
      cy.get('ul').should('be.empty')
    })
    it('should show a proper footer', () => {
      cy.get('button').contains('All').should('be.visible').should('be.disabled')
      cy.get('button').contains('Active').should('be.visible').should('be.enabled')
      cy.get('button').contains('Completed').should('be.visible').should('be.enabled')
    })
  })

  context('New Todo', () => {
    it('should allow to add todo items', () => {
      // create first todo
      cy.get('form>input').type(TODO_ITEM_ONE).type('{enter}')

      // make sure the 1st label contains the 1st todo text
      cy.get('ul>li').eq(-1).should('contain', TODO_ITEM_ONE)

      // create second todo
      cy.get('form>input').type(TODO_ITEM_TWO).type('{enter}')

      // FIXME This seems to be needed to get stuff going (but why?)
      cy.get('ul>li').should('have.length', 2)

      // make sure the second label contains the second todo text
      cy.get('ul>li').eq(-1).should('contain', TODO_ITEM_TWO)
    })
  })

  context('Mark as completed', function () {
    it('should allow to mark items as completed', () => {
      cy.get('ul>li').eq(0).click()
      cy.get('ul>li').eq(0).should('have.attr', 'style', 'text-decoration: line-through;')
      cy.get('ul>li').eq(1).should('have.attr', 'style', 'text-decoration: none;')
    })
    it('should stay marked even after browser reload', () => {
      cy.visit('/')
      cy.reload(true)
      cy.get('ul>li').should('have.length', 2)
      cy.get('ul>li').eq(0).should('have.attr', 'style', 'text-decoration: line-through;')
      cy.get('ul>li').eq(1).should('have.attr', 'style', 'text-decoration: none;')
    })
  })

  context('Filter by completion state', () => {
    it('should correctly show only active todos', () => {
      cy.get('button').contains('Active').click()
      cy.wait(200)
      cy.get('ul>li').should('have.length', 1)
      cy.get('ul>li').eq(-1).should('contain', TODO_ITEM_TWO)
    })
    it('should correctly show only completed todos', () => {
      cy.get('button').contains('Completed').click()
      cy.wait(200)
      cy.get('ul>li').should('have.length', 1)
      cy.get('ul>li').eq(-1).should('contain', TODO_ITEM_ONE)
    })
    it('should correctly show all todos', () => {
      cy.get('button').contains('All').click()
      cy.wait(200)
      cy.get('li').should('have.length', 2)
    })
  })
})
