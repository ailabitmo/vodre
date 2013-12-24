
package ru.ifmo.ailab.vodre.example;

import java.util.ArrayList;
import javax.ws.rs.Path;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import com.google.gson.Gson;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import org.apache.commons.io.IOUtils;
import org.drools.definition.rule.Rule;
import org.drools.definition.type.FactField;
import org.drools.event.rule.BeforeActivationFiredEvent;
import org.drools.event.rule.DefaultAgendaEventListener;
import org.drools.event.rule.ObjectInsertedEvent;
import org.drools.event.rule.ObjectRetractedEvent;
import org.drools.event.rule.ObjectUpdatedEvent;
import org.drools.event.rule.WorkingMemoryEventListener;
import org.drools.runtime.StatefulKnowledgeSession;
import org.drools.runtime.rule.Activation;
import org.drools.definition.type.FactType;
import org.glassfish.jersey.media.multipart.FormDataBodyPart;
import org.glassfish.jersey.media.multipart.FormDataMultiPart;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Path("/FileService/")
public class FileService {
    private static final Logger logger = LoggerFactory.getLogger(FileService.class);
    
    @POST
    @Path("/processFile/")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public Response processFile(FormDataMultiPart formData) 
                throws IOException {
         FormDataBodyPart fileElement = formData.getField("file");
         File file = fileElement.getEntityAs(File.class);
         FileInputStream stream = new FileInputStream(file);
         Integer fieldTypesCount = formData.getField("fieldTypesCount").getEntityAs(Integer.class);
         String packageName = formData.getField("package").getEntityAs(String.class);
         //logger.debug("Package="+packageName);
         final byte[] pkg = IOUtils.toByteArray(stream);
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
            
            for (int i = 0; i < fieldTypesCount; i++) {
                String fieldTypeName = formData.getField("fieldTypeName"+i).getEntityAs(String.class);
                //logger.debug("fieldTypeName"+i + "=" + fieldTypeName+";");
                if (fieldTypeName != null && !fieldTypeName.equals("")) {
                    FactType factType = session.getKnowledgeBase().getFactType(packageName, fieldTypeName);
                    Object instance = factType.newInstance();
                    Integer fieldsCount = formData.getField("fieldsCount"+i).getEntityAs(Integer.class);
                    //logger.debug("fieldsCount"+i + "=" + fieldsCount+";");
                    for (int j = 0; j < fieldsCount; j++) {
                        String fieldName = formData.getField("fieldName"+i+j).getEntityAs(String.class);
                        //logger.debug("fieldName"+i+j + "=" + fieldName+";");
                        if (fieldName != null && !fieldName.equals("")) {
                            FactField field = factType.getField(fieldName);
                            Class type = field.getType();
                            Object fieldValue = formData.getField("fieldValue"+i+j).getEntityAs(type);
                            //logger.debug("fieldValue"+i+j + "=" + fieldValue.toString()+";");
                            factType.set(instance, fieldName, fieldValue);
                        }
                    }
                    logger.debug("insert..");
                    session.insert(instance);
                }
            }

            logger.debug("Firing the rules...");
            session.fireAllRules();

            Gson gson = new Gson();
            String rulesJson = gson.toJson(workflowData);

            return Response.ok(rulesJson).type(MediaType.APPLICATION_JSON_TYPE).build();
        } catch (Exception ex) {
            logger.error(ex.getMessage());
            return Response.status(400).build();
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

            logger.info("ObjectInserted: {}", event);
            logger.debug("ObjectInserted: {}", event);
        }
        
        @Override
        public void objectUpdated(ObjectUpdatedEvent event) {
            TriggeredEventData eventData = new TriggeredEventData("objectUpdated", event.getObject().toString());
            workflowData.add(eventData);

            logger.debug("ObjectUpdated: {}", event);
        }
        
        @Override
        public void objectRetracted(ObjectRetractedEvent event) {
            TriggeredEventData eventData = new TriggeredEventData("objectRetracted", event.getOldObject().toString());
            workflowData.add(eventData);

            logger.debug("ObjectRetracted: {}", event);
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

            logger.debug("BeforeActivationFired: rule = {}; objects = {}",
                    rule.getName(),
                    activation.getObjects());
        }
        
    }
}
