package engineering.everest.prms.dto.mapper;

import engineering.everest.prms.dto.PassengerDto;
import engineering.everest.prms.entity.Passenger;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper
public interface PassengerMapper {

    PassengerMapper MAPPER = Mappers.getMapper(PassengerMapper.class);

    PassengerDto entityToDto(Passenger passenger);

    List<PassengerDto> entityToDtoList(List<Passenger> passengers);
}
