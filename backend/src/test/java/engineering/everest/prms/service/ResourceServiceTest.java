package engineering.everest.prms.service;

import engineering.everest.prms.entity.Resource;
import engineering.everest.prms.exception.ResourceNotFoundException;
import engineering.everest.prms.repository.ResourceRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static engineering.everest.prms.entity.MembershipLevel.GOLD;
import static engineering.everest.prms.entity.MembershipLevel.SILVER;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ResourceServiceTest {

    @Mock
    private ResourceRepository resourceRepository;

    @InjectMocks
    private ResourceService resourceService;

    @Test
    void provisionResource_persistsANewResource() {
        when(resourceRepository.save(any(Resource.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Resource resource = resourceService.provisionResource("Sleeping Pod", SILVER);

        assertThat(resource.getName()).isEqualTo("Sleeping Pod");
        assertThat(resource.getMinRequiredLevel()).isEqualTo(SILVER);
    }

    @Test
    void decommissionResource_deletesAnExistingResource() {
        UUID resourceId = UUID.randomUUID();
        when(resourceRepository.existsById(resourceId)).thenReturn(true);

        resourceService.decommissionResource(resourceId);

        verify(resourceRepository).deleteById(resourceId);
    }

    @Test
    void decommissionResource_throwsWhenResourceDoesNotExist() {
        UUID resourceId = UUID.randomUUID();
        when(resourceRepository.existsById(resourceId)).thenReturn(false);

        assertThatThrownBy(() -> resourceService.decommissionResource(resourceId))
            .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void findAccessibleTo_filtersResourcesByMembershipLevelInheritance() {
        Resource silverResource = Resource.builder().name("Food Station").minRequiredLevel(SILVER).build();
        Resource goldResource = Resource.builder().name("Private Cabin").minRequiredLevel(GOLD).build();
        when(resourceRepository.findAll()).thenReturn(List.of(silverResource, goldResource));

        List<Resource> accessible = resourceService.findAccessibleTo(SILVER);

        assertThat(accessible).containsExactly(silverResource);
    }

    @Test
    void findById_returnsTheMatchingResource() {
        UUID resourceId = UUID.randomUUID();
        Resource resource = Resource.builder().name("Food Station").minRequiredLevel(SILVER).build();
        when(resourceRepository.findById(resourceId)).thenReturn(Optional.of(resource));

        assertThat(resourceService.findById(resourceId)).isEqualTo(resource);
    }

    @Test
    void findById_throwsWhenResourceDoesNotExist() {
        UUID resourceId = UUID.randomUUID();
        when(resourceRepository.findById(resourceId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> resourceService.findById(resourceId))
            .isInstanceOf(ResourceNotFoundException.class);
    }
}
