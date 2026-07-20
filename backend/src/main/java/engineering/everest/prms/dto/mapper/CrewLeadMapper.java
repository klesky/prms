package engineering.everest.prms.dto.mapper;

import engineering.everest.prms.dto.CrewLeadDto;
import engineering.everest.prms.entity.CrewLead;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface CrewLeadMapper {

    CrewLeadMapper MAPPER = Mappers.getMapper(CrewLeadMapper.class);

    CrewLeadDto entityToDto(CrewLead crewLead);
}
