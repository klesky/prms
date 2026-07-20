package engineering.everest.prms.dto.mapper;

import engineering.everest.prms.dto.UsageLogDto;
import engineering.everest.prms.entity.UsageLog;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper
public interface UsageLogMapper {

    UsageLogMapper MAPPER = Mappers.getMapper(UsageLogMapper.class);

    @Mapping(source = "passenger.username", target = "passengerUsername")
    @Mapping(source = "resource.id", target = "resourceId")
    @Mapping(source = "resource.name", target = "resourceName")
    UsageLogDto entityToDto(UsageLog usageLog);
}
