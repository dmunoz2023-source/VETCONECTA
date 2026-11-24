import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@app/shared/decorators/current-user.decorator';
import { Roles } from '@app/shared/decorators/roles.decorator';
import { JwtHeadersGuard } from '@app/shared/guards/jwt-headers.guard';
import { RolesGuard } from '@app/shared/guards/roles.guard';
import { JwtPayload } from '@app/shared/types/jwt-payload.interface';
import { CreateVetBlockDto } from '../dto/create-vet-block.dto';
import { GetVetBlocksQueryDto } from '../dto/get-vet-blocks-query.dto';
import { UpdateVetBlockDto } from '../dto/update-vet-block.dto';
import { VetBlocksService } from '../services/vet-blocks.service';

/** [G3] Bloqueos de agenda de un veterinario. Solo recepción y admin. */
@ApiTags('scheduling')
@ApiBearerAuth()
@Controller('v1/scheduling/vets/:vetId/blocks')
@UseGuards(JwtHeadersGuard, RolesGuard)
@Roles('reception', 'admin')
export class VetBlocksController {
  constructor(private readonly blocksService: VetBlocksService) {}

  @Get()
  @ApiOperation({ summary: 'Listar bloqueos, con filtro opcional por fechas' })
  findAll(@Param('vetId', ParseUUIDPipe) vetId: string, @Query() query: GetVetBlocksQueryDto) {
    return this.blocksService.findByVet(vetId, query.from, query.to);
  }

  @Post()
  @ApiOperation({
    summary: 'Crear un bloqueo',
    description: 'Si cae sobre citas vigentes, las devuelve en affectedAppointments como advertencia.',
  })
  create(
    @Param('vetId', ParseUUIDPipe) vetId: string,
    @Body() dto: CreateVetBlockDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.blocksService.create(vetId, dto, user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar un bloqueo; devuelve las citas afectadas' })
  update(
    @Param('vetId', ParseUUIDPipe) vetId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVetBlockDto,
  ) {
    return this.blocksService.update(vetId, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Eliminar un bloqueo' })
  remove(@Param('vetId', ParseUUIDPipe) vetId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.blocksService.remove(vetId, id);
  }
}
