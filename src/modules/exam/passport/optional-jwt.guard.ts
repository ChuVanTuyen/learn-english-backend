import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtGuard extends AuthGuard('jwt') {
  // Nếu không có token hoặc token lỗi, đừng ném lỗi → tiếp tục request
  handleRequest(err: unknown, user: any) {
    // Có lỗi hoặc không có user? => cứ trả null, route vẫn chạy
    return user ?? null;
  }
}