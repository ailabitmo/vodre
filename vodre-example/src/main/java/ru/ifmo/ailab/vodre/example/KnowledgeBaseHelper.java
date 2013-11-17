package ru.ifmo.ailab.vodre.example;

import java.util.Collection;
import org.drools.KnowledgeBase;
import org.drools.builder.KnowledgeBuilder;
import org.drools.builder.KnowledgeBuilderFactory;
import org.drools.builder.ResourceType;
import org.drools.io.ResourceFactory;
import org.drools.runtime.StatefulKnowledgeSession;
import org.drools.runtime.StatelessKnowledgeSession;

public class KnowledgeBaseHelper {

    /**
     * {@link StatefulKnowledgeSession#dispose()} should be called once work
     * done.
     *
     * @param pkg
     * @return
     */
    public static StatefulKnowledgeSession createStatefulSession(final byte[] pkg) {
        final KnowledgeBuilder builder = KnowledgeBuilderFactory.newKnowledgeBuilder();
        builder.add(ResourceFactory.newByteArrayResource(pkg), ResourceType.PKG);
        if (builder.hasErrors()) {
            throw new IllegalArgumentException();
        }
        final KnowledgeBase kbase = builder.newKnowledgeBase();
        return kbase.newStatefulKnowledgeSession();
    }
    
    public static StatelessKnowledgeSession createStatelessSession(final byte[] pkg) {
        final KnowledgeBuilder builder = KnowledgeBuilderFactory.newKnowledgeBuilder();
        builder.add(ResourceFactory.newByteArrayResource(pkg), ResourceType.PKG);
        if (builder.hasErrors()) {
            throw new IllegalArgumentException();
        }
        final KnowledgeBase kbase = builder.newKnowledgeBase();
        return kbase.newStatelessKnowledgeSession();
    }
}
