package engineering.everest.prms.dto.mapper;

import engineering.everest.prms.dto.ResourceDto;
import engineering.everest.prms.entity.Resource;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper
public interface ResourceMapper {

    ResourceMapper MAPPER = Mappers.getMapper(ResourceMapper.class);

    ResourceDto entityToDto(Resource resource);

    List<ResourceDto> entityToDtoList(List<Resource> resources);
}
