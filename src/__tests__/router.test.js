import { describe, it, expect } from 'vitest'
import router from '@/router'

describe('router', () => {
  it('has a home route at /', () => {
    const home = router.getRoutes().find((r) => r.path === '/')
    expect(home).toBeDefined()
    expect(home.name).toBe('home')
    expect(home.meta.title).toBe('Home')
  })

  it('has a projects route at /projects', () => {
    const projects = router.getRoutes().find((r) => r.path === '/projects')
    expect(projects).toBeDefined()
    expect(projects.name).toBe('projects')
    expect(projects.meta.title).toBe('Projects')
  })

  it('has a projects route at /socials', () => {
    const projects = router.getRoutes().find((r) => r.path === '/socials')
    expect(projects).toBeDefined()
    expect(projects.name).toBe('socials')
    expect(projects.meta.title).toBe('Socials')
  })


  it('does not expose unexpected routes', () => {
    const paths = router.getRoutes().map((r) => r.path)
    expect(paths).toEqual(expect.arrayContaining(['/', '/projects', '/socials']))
    expect(paths.length).toBe(3)
  })
})
