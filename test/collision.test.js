/* eslint-env mocha */

const AABB = require('prismarine-physics/lib/aabb')
const expect = require('expect')

// The server places a player flush against a wall by subtracting the
// half-width from the block face. In doubles -2.0 - 0.3 + 0.3 is
// -1.9999999999999998, a hair inside the block. Vanilla's collision
// (VoxelShape.collide) allows 1.0E-7 for this, so the wall still stops the
// player. Without that tolerance the block is skipped, the client walks into
// it, and the server corrects it ("moved wrongly!") every tick.

describe('Collision tolerance', () => {
  it('stops a move into a wall the box is flush against', () => {
    const block = new AABB(-2, 107, -91, -1, 108, -90)
    const player = new AABB(-2.3 - 0.3, 107.42, -90.8, -2.3 + 0.3, 109.22, -90.2)
    expect(player.maxX).toBeGreaterThan(block.minX)
    expect(block.computeOffsetX(player, 0.098)).toBe(0)
  })

  it('stops a move into a wall the box is flush against, on every axis and direction', () => {
    const h = 1e-12
    const block = new AABB(0, 0, 0, 1, 1, 1)
    expect(block.computeOffsetX(new AABB(-0.6 + h, 0.2, 0.2, h, 0.8, 0.8), 0.1)).toBe(0)
    expect(block.computeOffsetX(new AABB(1 - h, 0.2, 0.2, 1.6 - h, 0.8, 0.8), -0.1)).toBe(0)
    expect(block.computeOffsetY(new AABB(0.2, -1.8 + h, 0.2, 0.8, h, 0.8), 0.1)).toBe(0)
    expect(block.computeOffsetY(new AABB(0.2, 1 - h, 0.2, 0.8, 2.8 - h, 0.8), -0.1)).toBe(0)
    expect(block.computeOffsetZ(new AABB(0.2, 0.2, -0.6 + h, 0.8, 0.8, h), 0.1)).toBe(0)
    expect(block.computeOffsetZ(new AABB(0.2, 0.2, 1 - h, 0.8, 0.8, 1.6 - h), -0.1)).toBe(0)
  })

  it('lets a box resting a hair inside the floor slide sideways', () => {
    const floor = new AABB(0, 63, 0, 1, 64, 1)
    const player = new AABB(0.2, 63.99999999, 0.2, 0.8, 65.8, 0.8)
    expect(floor.computeOffsetX(player, 0.1)).toBe(0.1)
  })

  it('still limits a move to the gap before a wall', () => {
    const block = new AABB(1, 64, 0, 2, 65, 1)
    const player = new AABB(0.2, 64, 0.2, 0.8, 65.8, 0.8)
    expect(block.computeOffsetX(player, 0.5)).toBeCloseTo(0.2, 9)
  })
})
