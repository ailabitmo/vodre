
package ru.ifmo.ailab.vodre.example;

import java.util.ArrayList;
import javax.ws.rs.Path;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import com.google.gson.Gson;
import com.sun.jersey.core.header.FormDataContentDisposition;
import java.io.IOException;
import org.glassfish.jersey.media.multipart.FormDataParam;
import java.io.InputStream;
import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import org.apache.commons.io.IOUtils;
import org.drools.definition.rule.Rule;
import org.drools.definition.type.FactType;
import org.drools.event.rule.BeforeActivationFiredEvent;
import org.drools.event.rule.DefaultAgendaEventListener;
import org.drools.event.rule.ObjectInsertedEvent;
import org.drools.event.rule.ObjectRetractedEvent;
import org.drools.event.rule.ObjectUpdatedEvent;
import org.drools.event.rule.WorkingMemoryEventListener;
import org.drools.runtime.StatefulKnowledgeSession;
import org.drools.runtime.rule.Activation;

@Path("/FileService")
public class FileService {
    @Path("/processFile")
    @POST
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public Response processFile(
		@FormDataParam("file") InputStream uploadedInputStream,
		@FormDataParam("file") FormDataContentDisposition fileDetail,
                ArrayList<FactType> inputFacts) 
                throws IOException {
        
        final byte[] pkg = IOUtils.toByteArray(uploadedInputStream);

        StatefulKnowledgeSession session = null;
        try {
            session = KnowledgeBaseHelper.createStatefulSession(pkg);

            ArrayList<IWorkflowData> workflowData = new ArrayList<IWorkflowData>();

            WorkingMemoryEventListenerImpl workingMemoryEventListener =
                    new WorkingMemoryEventListenerImpl(workflowData);
            AgendaEventListenerImpl agendaEventListener = 
                    new AgendaEventListenerImpl(workflowData);
            session.addEventListener(workingMemoryEventListener);
            session.addEventListener(agendaEventListener);
            
            for (FactType fact : inputFacts) {
                session.insert(fact);
            }
            
            session.fireAllRules();

            Gson gson = new Gson();
            String rulesJson = gson.toJson(workflowData);

            return Response.ok(rulesJson).type(MediaType.APPLICATION_JSON_TYPE).build();
        } catch (Exception ex) {
            return Response.serverError().build();
        } finally {
            session.dispose();
        }
    }
    
    private class WorkingMemoryEventListenerImpl
            implements WorkingMemoryEventListener {
        private ArrayList<IWorkflowData> workflowData;

        public WorkingMemoryEventListenerImpl(ArrayList<IWorkflowData> workflowData) {
            this.workflowData = workflowData;
        }

        @Override
        public void objectInserted(ObjectInsertedEvent event) {
            TriggeredEventData eventData = new TriggeredEventData("objectInserted", event.getObject().toString());
            workflowData.add(eventData);
        }
        
        @Override
        public void objectUpdated(ObjectUpdatedEvent event) {
            TriggeredEventData eventData = new TriggeredEventData("objectUpdated", event.getObject().toString());
            workflowData.add(eventData);
        }
        
        @Override
        public void objectRetracted(ObjectRetractedEvent event) {
            TriggeredEventData eventData = new TriggeredEventData("objectRetracted", event.getOldObject().toString());
            workflowData.add(eventData);
        }
    }
    
    private class AgendaEventListenerImpl extends DefaultAgendaEventListener {
        private ArrayList<IWorkflowData> workflowData;

        public AgendaEventListenerImpl(ArrayList<IWorkflowData> workflowData) {
            this.workflowData = workflowData;
        }

        @Override
        public void beforeActivationFired(BeforeActivationFiredEvent event) {
            Activation activation = event.getActivation();
            Rule rule = activation.getRule();
            TriggeredRuleData ruleData = new TriggeredRuleData(rule.getName());
            workflowData.add(ruleData);
        }
        
    }
}
