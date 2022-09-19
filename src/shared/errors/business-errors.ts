/* eslint-disable prettier/prettier */
export function BusinessLogicException(message: string, type: number) {
    this.message = message;
    this.type = type;
  }
  
  export enum BusinessError {
    NOT_FOUND,
    PRECONDITION_FAILED,
    BAD_REQUEST
  }
  /* archivo: src/shared/errors/business-errors.ts */