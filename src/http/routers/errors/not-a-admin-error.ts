export class NotAdminError extends Error {
  constructor() {
    super('User is not a admin.')
  }
}
