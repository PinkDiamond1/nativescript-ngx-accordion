# Nativescript-Ngx-Accordion

A Nativescript Angular UI Control for Expand/Collapse Toggle panels. It is an extension of the (IListView)[] control.

## Setup

`npm install nativescript-ngx-accordion --save`

Import the module into your _app-module_ 

```
import { AccordionViewModule } from 'nativescript-ngx-accordion';

```

## Getting Started

Similar to the ListView, you need to define the ListItem template, as shown
below.

```
<Accordion
    limit="30"
    [items]="items"
    [templateRef]="accordion"
    (eofItems)="addMore()"
  >
    <ng-template #accordion let-item="item" let-index="index">
      <AccordionItem>
        <AccordionHeader>
          <!-- Place the header here -->
        </AccordionHeader>
        <AccordionContent>
          <!-- Place the main content here -->
        </AccordionContent>
        <AccordionFooter>
        <!-- Place the footer here -->
        </AccordionFooter>
        <AccordionDivider>
          <!-- Spacer gap for the items -->
        </AccordionDivider>
        <AccordionPlaceholder>
          <!-- Skeleton for intermediate loading -->
        </AccordionPlaceholder>
      </AccordionItem>
    </ng-template>
  </Accordion>
```

- The AccordionContent is where you would insert your item content, possibly an Angular Component
- The AccordionDivider is simply a spacer tag for the items, like a horizontal line
- The AccordionPlaceholder is the skeleton for your item before the content gets instantiated

### Options

The AccordionView accepts __limit__ as an argument which is default to 30.

It emits a value with the __eofItems__ emitter when the list has reaches the end, for async loading more data to the list.

### AccordionViewService

The AccordionService can be used to add more items to the list with the method
__addItems()__


# Examples

Provided in the demo app




