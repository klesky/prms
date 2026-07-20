package engineering.everest.prms.service;

import engineering.everest.prms.entity.MembershipLevel;
import engineering.everest.prms.entity.Resource;
import engineering.everest.prms.exception.ResourceNotFoundException;
import engineering.everest.prms.repository.ResourceRepository;
import engineering.everest.prms.repository.UsageLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ResourceService {

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private UsageLogRepository usageLogRepository;

    public Resource provisionResource(String name, MembershipLevel minRequiredLevel) {
        return resourceRepository.save(Resource.builder().name(name).minRequiredLevel(minRequiredLevel).build());
    }

    @Transactional
    public void decommissionResource(UUID resourceId) {
        if (!resourceRepository.existsById(resourceId)) {
            throw new ResourceNotFoundException(resourceId);
        }
        usageLogRepository.deleteByResourceId(resourceId);
        resourceRepository.deleteById(resourceId);
    }

    public List<Resource> findAll() {
        return resourceRepository.findAll();
    }

    public Resource findById(UUID resourceId) {
        return resourceRepository.findById(resourceId)
            .orElseThrow(() -> new ResourceNotFoundException(resourceId));
    }

    public List<Resource> findAccessibleTo(MembershipLevel passengerLevel) {
        return resourceRepository.findAll().stream()
            .filter(resource -> resource.isAccessibleTo(passengerLevel))
            .toList();
    }
}
