import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiNoContentResponse,
  ApiOkResponse,
  // ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Category } from 'database/entities';
import { FindOneParams } from 'database/dtos/find-one-params.dto';
import { RolesGuard } from '../auth/guards';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateCategoryDto } from './dtos';
import { CategoryResponseDto } from './dtos/get-category.dto';
import { CategoryService } from './category.service';
// import { CategoryDto } from './dtos/category.dto';

@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('')
  // @Roles(UserRole.ADMIN)
  // @ApiResponse({ type: PageDto<CategoryDto>, status: 200 })
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  async getCategories(): Promise<Category[]> {
    return this.categoryService.categories();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ status: HttpStatus.OK, type: CategoryResponseDto })
  async getCategoryById(@Param() { id }: FindOneParams): Promise<CategoryResponseDto> {
    return this.categoryService.getCategoryById(id);
  }

  @Post('')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('access-token')
  @ApiNoContentResponse()
  @ApiBody({ type: CreateCategoryDto })
  async create(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
    // eslint-disable-next-line no-param-reassign
    return this.categoryService.createCategory(createCategoryDto);
  }

  // @Put('/:id')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // @ApiBearerAuth('access-token')
  // @ApiNoContentResponse()
  // @ApiBody({ type: UpdateCategoryDto })
  // async update(
  //   @Param() { id }: FindOneParams,
  //   @Body() updateCategoryDto: UpdateCategoryDto,
  // ): Promise<Category> {
  //   return this.categoryService.UpdateCategoryDto(id, updateCategoryDto);
  // }

  // @Delete('/delete')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // @Roles(UserRole.ADMIN)
  // @ApiNoContentResponse()
  // @ApiBody({ type: DeleteUserDto })
  // delete(@CurrentUser() user: User, @Body() { password }: DeleteUserDto): Promise<void> {
  //   return this.userService.deleteUser(user, password);
  // }
}
