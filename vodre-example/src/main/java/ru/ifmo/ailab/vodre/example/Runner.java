package ru.ifmo.ailab.vodre.example;

import java.io.IOException;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.core.Response;
import org.apache.commons.io.IOUtils;
import org.drools.definition.type.FactType;
import org.drools.event.rule.BeforeActivationFiredEvent;
import org.drools.event.rule.DefaultAgendaEventListener;
import org.drools.event.rule.ObjectInsertedEvent;
import org.drools.event.rule.ObjectRetractedEvent;
import org.drools.event.rule.ObjectUpdatedEvent;
import org.drools.event.rule.WorkingMemoryEventListener;
import org.drools.runtime.StatefulKnowledgeSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Path("/")
public class Runner {
    
    private static final Logger logger = LoggerFactory.getLogger(Runner.class);
    
    @GET
    public Response run()
            throws IOException, InstantiationException, IllegalAccessException {
        final byte[] pkg = IOUtils.toByteArray(this.getClass()
                .getResourceAsStream("/credit.pkg"));
        StatefulKnowledgeSession session = null;
        try {
            session = KnowledgeBaseHelper.createStatefulSession(pkg);
            logger.debug("Created a session");
            
            session.addEventListener(new WorkingMemoryEventListenerImpl());
            session.addEventListener(new AgendaEventListenerImpl());
            
            FactType applicationForCredit = session.getKnowledgeBase().getFactType("credit", "ApplicationForCredit");
            FactType creditDecision = session.getKnowledgeBase().getFactType("credit", "CreditDecision");
            Object application = applicationForCredit.newInstance();
            applicationForCredit.set(application, "Age", 17);
            Object decision = creditDecision.newInstance();
            
            session.insert(application);
            session.insert(decision);
            logger.debug("Inserted facts");
            
            logger.debug("Firing the rules...");
            session.fireAllRules();
        } finally {
            session.dispose();
        }
        
        return Response.ok("{\"name\": \"Hello World!\"}").build();
    }
    
    private class WorkingMemoryEventListenerImpl
            implements WorkingMemoryEventListener {
        
        @Override
        public void objectInserted(ObjectInsertedEvent event) {
            logger.debug("ObjectInserted: {}", event);
        }
        
        @Override
        public void objectUpdated(ObjectUpdatedEvent event) {
            logger.debug("ObjectUpdated: {}", event);
        }
        
        @Override
        public void objectRetracted(ObjectRetractedEvent event) {
            logger.debug("ObjectRetracted: {}", event);
        }
    }
    
    private class AgendaEventListenerImpl extends DefaultAgendaEventListener {

        @Override
        public void beforeActivationFired(BeforeActivationFiredEvent event) {
            logger.debug("BeforeActivationFired: rule = {}; objects = {}", 
                    event.getActivation().getRule().getName(),
                    event.getActivation().getObjects());
        }
        
    }
    
}
