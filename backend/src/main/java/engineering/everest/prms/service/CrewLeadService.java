package engineering.everest.prms.service;

import engineering.everest.prms.entity.CrewLead;
import engineering.everest.prms.exception.CrewLeadLimitExceededException;
import engineering.everest.prms.exception.CrewLeadNotFoundException;
import engineering.everest.prms.exception.DuplicateCrewLeadException;
import engineering.everest.prms.repository.CrewLeadRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CrewLeadService {

    @Autowired
    private CrewLeadRepository crewLeadRepository;

    @Value("${prms.max-crew-leads}")
    private int maxCrewLeads;

    public CrewLead registerCrewLead(String username, String name) {
        if (crewLeadRepository.existsById(username)) {
            throw new DuplicateCrewLeadException(username);
        }
        if (crewLeadRepository.count() >= maxCrewLeads) {
            throw new CrewLeadLimitExceededException(maxCrewLeads);
        }
        return crewLeadRepository.save(CrewLead.builder().username(username).name(name).build());
    }

    public List<CrewLead> findAll() {
        return crewLeadRepository.findAll();
    }

    public void deleteCrewLead(String username) {
        if (!crewLeadRepository.existsById(username)) {
            throw new CrewLeadNotFoundException(username);
        }
        crewLeadRepository.deleteById(username);
    }
}
